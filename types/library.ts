import { Site } from "./cred";

export namespace GoogleBooks {
  export interface SuccessResponse {
    kind: string;
    totalItems: number;
    items: Book[];
  }
  export interface Book {
    kind: string;
    id: string;
    etag: string;
    selfLink: string;
    volumeInfo: VolumeInfo;
    saleInfo: SalesInfo;
    accessInfo: AccessInfo;
    searchInfo: SearchInfo;
  }
  export interface LibraryBook extends GoogleBooks.Book {
    site: Site;
    available_count: number;
    total_count: number;
    added_by: string;
    checkout_history: KioskItem[] | null;
  }
  export interface VolumeInfo {
    title: string;
    authors: string[];
    publisher: string;
    publishedDate: string;
    description: string;
    industryIdentifiers: { type: "ISBN_10" | "ISBN_13"; identifier: string }[];
    readingModes: { text: boolean; image: boolean };
    pageCount: number;
    printType: string;
    categories: string[];
    maturityRating: string;
    allowAnonLogging: boolean;
    contentVersion: string;
    panelizationSummary: {
      containsEpubBubbles: boolean;
      containsImageBubbles: boolean;
    };
    imageLinks: {
      smallThumbnail: string;
      thumbnail: string;
    };
    language: string;
    previewLink: string;
    infoLink: string;
    canonicalVolumeLink: string;
  }
  export interface SalesInfo {
    country: string;
    saleability: string;
    isEbook: boolean;
  }
  export interface AccessInfo {
    country: string;
    viewability: string;
    embeddable: boolean;
    publicDomain: boolean;
    textToSpeechPermission: string;
    epub: { isAvailable: boolean };
    pdf: { isAvailable: boolean };
    webReaderLink: string;
    accessViewStatus: string;
    quoteSharingAllowed: boolean;
  }
  export interface SearchInfo {
    textSnippet: string;
  }
  export interface ErrorResponse {
    error: {
      code: number;
      message: string;
      errors: {
        message: string;
        domain: string;
        reason: string;
      }[];
    };
  }
}

export interface KioskItem {
  item: GoogleBooks.Book;
  checkout_date: Date;
  due_date: Date;
  return_date: Date | null;
  is_returned: boolean;
  extension_count: number;
  has_completed_book_report: boolean;
}
