import { IsString, IsObject, IsOptional, IsNotEmpty } from 'class-validator'

/**
 * DTO for receiving scraped data from Scraping Service
 * 
 * This is the payload that Scraping Service sends to Gateway via HTTP POST
 * when notifying about completed scraping tasks that should be sent to Notion.
 * 
 * Flow:
 * 1. Scraping Service scrapes URL
 * 2. Scraping Service cleans data
 * 3. Scraping Service POSTs this DTO to Gateway /api/scraping/notify-notion
 * 4. Gateway publishes to RabbitMQ channels.notion.send
 * 5. Gateway returns 202 ACCEPTED immediately (async)
 */
export class NotifyNotionDto {
  /**
   * User ID for WhatsApp notification tracking
   */
  @IsNotEmpty()
  @IsString()
  userId: string

  /**
   * Title of the scraped page (required by Notion)
   */
  @IsNotEmpty()
  @IsString()
  title: string

  /**
   * Source URL (for reference and backlinks in Notion)
   */
  @IsOptional()
  @IsString()
  url?: string

  /**
   * Cleaned scraping data (title, sections, links, etc)
   * This is the actual content to be saved in Notion
   */
  @IsNotEmpty()
  @IsObject()
  data: Record<string, any>

   /**
    * Optional parent page ID in Notion
    * If not provided, uses NOTION_PARENT_PAGE_ID from environment variables as fallback
    * This ensures all pages are created under the configured parent page by default
    * 
    * Example: "336a9ff3e074807a9cc1cd3ef9aead2b"
    */
   @IsOptional()
   @IsString()
   notionPageId?: string
}
