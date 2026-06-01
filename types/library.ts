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
    volumeInfo: VolumeInfo; // Required
    saleInfo: SalesInfo;
    accessInfo: AccessInfo;
    searchInfo: SearchInfo;
  }
  export interface VolumeInfo {
    title: string; // Required
    authors: string[]; // Required
    publisher: string;
    publishedDate: string; // Required
    description: string; // Required
    industryIdentifiers: { type: "ISBN_10" | "ISBN_13"; identifier: string }[]; // Required
    readingModes: { text: boolean; image: boolean };
    pageCount: number; // Required
    printType: string;
    categories: string[]; // Required
    maturityRating: string;
    allowAnonLogging: boolean;
    contentVersion: string;
    panelizationSummary: {
      containsEpubBubbles: boolean;
      containsImageBubbles: boolean;
    };
    imageLinks: {
      smallThumbnail: string;
      thumbnail: string; // Required
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

type RequiredVolumeInfoKeys =
  | "title"
  | "authors"
  | "publishedDate"
  | "description"
  | "industryIdentifiers"
  | "pageCount"
  | "categories";
// | "imageLinks";

type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export type ManualBook = Omit<Partial<GoogleBooks.Book>, "volumeInfo"> & {
  volumeInfo: PartialExcept<GoogleBooks.VolumeInfo, RequiredVolumeInfoKeys>;
};

export type BookInfo = GoogleBooks.Book | ManualBook;

export interface LibraryBook {
  id: string;
  book_info: BookInfo;
  site: Site;
  available_count: number;
  total_count: number;
  created_at: Date;
  updated_at: Date;
  checkout_history: KioskItem[] | null;
}

export interface KioskItem {
  book_info: BookInfo;
  checkout_date: Date;
  due_date: Date;
  return_date: Date | null;
  is_returned: boolean;
  extension_count: number;
  has_completed_book_report: boolean;
}
