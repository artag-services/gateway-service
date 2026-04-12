import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQService } from '../../rabbitmq/rabbitmq.service';
import { ROUTING_KEYS } from '../../rabbitmq/constants/queues';
import { WhatsappEventPayload } from '../constants/events';

/**
 * Interceptor que detecta mensajes de scraping desde WhatsApp
 * Patrones soportados:
 * - "scrappea https://example.com"
 * - "scrape https://example.com"
 * - "scrap https://example.com"
 * - "scrapea https://example.com"
 */
@Injectable()
export class ScrapingMessageInterceptor {
  private readonly logger = new Logger(ScrapingMessageInterceptor.name);

  // Palabras clave para detectar solicitudes de scraping (case-insensitive)
  private readonly scrapingKeywords = ['scrappea', 'scrapeá', 'scrappe', 'scraper', 'scrape', 'scrap', 'scrapea'];

  constructor(private readonly rabbitmq: RabbitMQService) {}

  /**
   * Verifica si un mensaje contiene una solicitud de scraping
   * @param payload - Payload del evento de WhatsApp
   * @returns true si es una solicitud de scraping, false en caso contrario
   */
  isScrapingRequest(payload: WhatsappEventPayload): boolean {
    if (!payload || !payload.value || !payload.value.messages || payload.value.messages.length === 0) {
      return false;
    }

    const message = payload.value.messages[0];
    if (!message.text || !message.text.body) {
      return false;
    }

    const text = message.text.body.toLowerCase().trim();

    // Verificar si contiene alguna palabra clave de scraping
    return this.scrapingKeywords.some((keyword) => text.startsWith(keyword));
  }

  /**
   * Extrae la URL y tipo de scraping del mensaje
   * @param payload - Payload del evento de WhatsApp
   * @returns Objeto con URL y tipo de scraping, o null si no se encuentra
   */
  extractScrapingTask(payload: WhatsappEventPayload): ScrapingTask | null {
    if (!this.isScrapingRequest(payload)) {
      return null;
    }

    const message = payload.value.messages[0];
    const text = message.text.body.trim();

    // Remover palabra clave del inicio
    let taskText = text;
    for (const keyword of this.scrapingKeywords) {
      if (text.toLowerCase().startsWith(keyword)) {
        taskText = text.substring(keyword.length).trim();
        break;
      }
    }

    // Extraer URL (primer patrón que coincida con http:// o https://)
    const urlMatch = taskText.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) {
      this.logger.warn('No URL found in scraping request');
      return null;
    }

    const url = urlMatch[0];

    // Extraer parámetros adicionales (si los hay)
    const params = this.parseScrapingParams(taskText);

    return {
      userId: message.from,
      url,
      type: params.type || 'simple',
      selectors: params.selectors,
      waitFor: params.waitFor,
      credentials: params.credentials,
      searchQuery: params.searchQuery,
      timestamp: Number(message.timestamp),
      originalMessage: text,
    };
  }

  /**
   * Publica una solicitud de scraping a RabbitMQ
   * @param payload - Payload del evento de WhatsApp
   */
  async handleScrapingRequest(payload: WhatsappEventPayload): Promise<void> {
    const task = this.extractScrapingTask(payload);

    if (!task) {
      this.logger.warn('Failed to extract scraping task from message');
      return;
    }

    this.logger.log(`Publishing scraping task for user ${task.userId}: ${task.url}`);

    try {
      // Transformar ScrapingTask en ScrapingMessage esperado por el servicio de scraping
      const scrapingMessage = {
        requestId: `${task.userId}-${task.timestamp}`,
        userId: task.userId,
        url: task.url,
        instructions: {
          type: task.type,
          action: `Scrape content from ${task.url}`,
          selectors: this.parseSelectorsFromTask(task),
          login: this.parseCredentialsFromTask(task),
          search: task.searchQuery
            ? {
                query: task.searchQuery,
                searchSelector: 'input[type="search"], input[name*="search"], input[placeholder*="search" i]',
                submitSelector: 'button[type="submit"], button[aria-label*="search" i]',
                waitTime: 3000,
              }
            : undefined,
          timeout: 30000,
        },
        timestamp: new Date(),
      };

      this.rabbitmq.publish(ROUTING_KEYS.SCRAPING_TASK, scrapingMessage as unknown as Record<string, unknown>);

      this.logger.log(`Scraping task published: ${task.url}`);
    } catch (error) {
      this.logger.error(`Failed to publish scraping task: ${error}`);
      throw error;
    }
  }

  /**
   * Parsea parámetros adicionales del mensaje de scraping
   * Ejemplos:
   * - "scrappea https://example.com tipo:login"
   * - "scrappea https://example.com tipo:search query:iphone"
   * - "scrappea https://example.com selectores:.producto,.precio"
   */
  private parseScrapingParams(text: string): ScrapingParams {
    const params: ScrapingParams = {};

    // Detectar tipo de scraping (simple, login, search, login+search, extract)
    const typeMatch = text.match(/tipo:\s*(\w+)/i);
    if (typeMatch) {
      const typeValue = typeMatch[1].toLowerCase();
      if (['simple', 'login', 'search', 'login+search', 'extract'].includes(typeValue)) {
        params.type = typeValue as 'simple' | 'login' | 'search' | 'login+search' | 'extract';
      }
    }

    // Detectar query de búsqueda
    const queryMatch = text.match(/query:\s*([^,\n]+)/i);
    if (queryMatch) {
      params.searchQuery = queryMatch[1].trim();
    }

    // Detectar selectores CSS
    const selectorsMatch = text.match(/selectores:\s*([^,\n]+)/i);
    if (selectorsMatch) {
      params.selectors = selectorsMatch[1].split(',').map((s: string) => s.trim());
    }

    // Detectar elemento a esperar
    const waitMatch = text.match(/esperar:\s*([^,\n]+)/i);
    if (waitMatch) {
      params.waitFor = waitMatch[1].trim();
    }

    return params;
  }

  /**
   * Convierte selectores CSS de ScrapingTask al formato esperado por ScrapingInstructions
   */
  private parseSelectorsFromTask(task: ScrapingTask): Record<string, string> | undefined {
    if (!task.selectors || task.selectors.length === 0) {
      return undefined;
    }

    const selectorsMap: Record<string, string> = {};
    task.selectors.forEach((selector: string, index: number) => {
      selectorsMap[`selector_${index}`] = selector;
    });

    return selectorsMap;
  }

  /**
   * Convierte credenciales de ScrapingTask al formato esperado por LoginConfig
   */
  private parseCredentialsFromTask(task: ScrapingTask) {
    if (!task.credentials || task.type !== 'login') {
      return undefined;
    }

    return {
      username: task.credentials.username || task.credentials.email || '',
      password: task.credentials.password || '',
      usernameSelector: 'input[type="email"], input[name*="user"], input[name*="email"]',
      passwordSelector: 'input[type="password"]',
      submitSelector: 'button[type="submit"], button[aria-label*="login" i]',
      waitForNavigation: true,
    };
  }
}

/**
 * Interfaz para una tarea de scraping extraída de un mensaje de WhatsApp
 */
export interface ScrapingTask {
  userId: string; // Número de teléfono del usuario
  url: string;
  type: 'simple' | 'login' | 'search' | 'login+search' | 'extract';
  selectors?: string[];
  waitFor?: string;
  credentials?: {
    email?: string;
    password?: string;
    username?: string;
  };
  searchQuery?: string;
  timestamp: number;
  originalMessage: string;
}

/**
 * Interfaz para parámetros adicionales de scraping
 */
interface ScrapingParams {
  type?: 'simple' | 'login' | 'search' | 'login+search' | 'extract';
  selectors?: string[];
  waitFor?: string;
  searchQuery?: string;
  credentials?: {
    email?: string;
    password?: string;
    username?: string;
  };
}
