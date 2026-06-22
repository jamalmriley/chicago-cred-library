"use client";

import { useAdminContext } from "@/contexts/admin-context";
import { PermissionUser } from "@/lib/auth";
import { fetchGoogleBook } from "@/lib/books";
import { getPreferredIsbn, safeParseDate } from "@/lib/utils";
import { getSiteById, Site, SITES } from "@/types/cred";
import { Action } from "@/types/data";
import { GoogleBooks, LibraryBook, ManualBook } from "@/types/library";
import { useUser } from "@clerk/nextjs";
import { ChevronDown, Info, Pencil, Plus, Trash, X } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import useSound from "use-sound";
import { AdminBookLineItem } from "./BookLineItem";
import { BookScannerWrapper } from "./BookScannerWrapper";
import Required from "./Required";
import SiteDropdownMenuContent from "./SiteDropdownMenuContent";
import { AbacButton, AbacContextMenuItem, AbacField } from "./ui/abac";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { DropdownMenu, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Spinner } from "./ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";

const actionInfo = {
  create: {
    title: "Add book",
    description: "Scan or fill out the book's information below.",
    buttonText: {
      default: "Add",
      loading: "Adding",
    },
    trigger: (user: PermissionUser, action: Action) => (
      <AbacButton
        user={user}
        action={action}
        resource="books"
        className="molde-button"
      >
        <Plus />
        Add book
      </AbacButton>
    ),
  },
  read: {
    title: "View book details",
    description: "",
    buttonText: {
      default: null,
      loading: null,
    },
    trigger: (
      user: PermissionUser,
      action: Action,
      setIsOpen: Dispatch<SetStateAction<boolean>>,
    ) => (
      <AbacContextMenuItem
        user={user}
        action={action}
        resource="books"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
      >
        <Info />
        View book details
      </AbacContextMenuItem>
    ),
  },
  update: {
    title: "Edit book details",
    description: "Edit the information below.",
    buttonText: {
      default: "Update",
      loading: "Updating",
    },
    trigger: (
      user: PermissionUser,
      action: Action,
      setIsOpen: Dispatch<SetStateAction<boolean>>,
    ) => (
      <AbacContextMenuItem
        user={user}
        action={action}
        resource="books"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
      >
        <Pencil />
        Edit book details
      </AbacContextMenuItem>
    ),
  },
  delete: {
    title: "Are you sure?",
    description: "This action cannot be undone.",
    buttonText: {
      default: "Delete",
      loading: "Deleting",
    },
    trigger: (
      user: PermissionUser,
      action: Action,
      setIsOpen: Dispatch<SetStateAction<boolean>>,
    ) => (
      <AbacContextMenuItem
        user={user}
        action={action}
        resource="books"
        variant="destructive"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
      >
        <Trash />
        Delete book
      </AbacContextMenuItem>
    ),
  },
};

export default function AdminBookDialog({
  action,
  data,
}: {
  action: Action;
  data?: LibraryBook;
}) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const tabs: ("Scan" | "Manual")[] = ["Scan", "Manual"];

  if (!user) return;
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {actionInfo[action].trigger(user, action, setIsOpen)}
      </DialogTrigger>
      <DialogContent className="max-h-[75vh] flex flex-col overflow-y-scroll scrollbar-none">
        <DialogHeader>
          <DialogTitle>{actionInfo[action].title}</DialogTitle>
          <DialogDescription>
            {actionInfo[action].description}
          </DialogDescription>
        </DialogHeader>

        {action === "create" ? (
          <Tabs defaultValue={tabs[0]} className="h-full overflow-y-hidden">
            <TabsList variant="line" className="mb-3">
              {tabs.map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent
                key={tab}
                value={tab}
                className="flex-1 min-h-0 overflow-y-auto p-5 border rounded-xl scrollbar-none"
              >
                <AdminBookForm
                  action={action}
                  data={data}
                  setIsDrawerOpen={setIsOpen}
                  tab={tab}
                />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <AdminBookForm
            action={action}
            data={data}
            setIsDrawerOpen={setIsOpen}
            tab="Manual"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AdminBookForm({
  action,
  data,
  setIsDrawerOpen,
  tab,
}: {
  action: Action;
  data?: LibraryBook;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  tab: "Scan" | "Manual";
}) {
  const { setLastUpdated } = useAdminContext();
  const { isLoaded, user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [book, setBook] = useState<GoogleBooks.Book | null>(null);
  const [playBeep] = useSound("/sounds/beep.m4a", { volume: 0.5 });

  const handleScan = async (isbn: string) => {
    playBeep();
    const book = await fetchGoogleBook(isbn);
    if (!book) return;
    setBook(book);
  };

  const handleLookup = async (isbn: string) => {
    const book = await fetchGoogleBook(isbn);
    if (!book) return;
    setBook(book);
  };

  const volumeInfo = data?.book_info.volumeInfo;

  const [selectedSite, setSelectedSite] = useState<Site | null>(
    data?.site ?? null,
  );
  const [title, setTitle] = useState(volumeInfo?.title ?? "");
  const [authors, setAuthors] = useState<string[]>(volumeInfo?.authors ?? [""]);
  const [authorCount, setAuthorCount] = useState(
    volumeInfo?.authors.length ?? 1,
  );
  const [open, setOpen] = useState(false);
  const [publishedDate, setPublishedDate] = useState<Date | undefined>(
    data ? safeParseDate(data.book_info.volumeInfo.publishedDate) : undefined,
  );
  const [isbn, setIsbn] = useState(
    data ? getPreferredIsbn(data.book_info.volumeInfo.industryIdentifiers) : "",
  );
  const [description, setDescription] = useState(volumeInfo?.description ?? "");
  const [category, setCategory] = useState(
    volumeInfo?.categories.join(", ") ?? "",
  );
  const [pageCount, setPageCount] = useState(
    String(volumeInfo?.pageCount) ?? "",
  );

  const [isTestData, setIsTestData] = useState(false);

  const isButtonDisabled: boolean =
    !selectedSite ||
    title === "" ||
    authors.filter((author) => author !== "").length === 0 ||
    !publishedDate ||
    isbn === "" ||
    (isbn.length !== 10 && isbn.length !== 12 && isbn.length !== 13) ||
    description === "" ||
    category === "" ||
    pageCount === "";

  const clearAllFields = () => {
    setSelectedSite(null);
    setTitle("");
    setAuthors([""]);
    setAuthorCount(1);
    setPublishedDate(undefined);
    setIsbn("");
    setDescription("");
    setCategory("");
    setPageCount("");
    setIsDrawerOpen(false);
  };

  const insertAuthor = (index: number) => {
    setAuthors((prev) => [...prev.slice(0, index), "", ...prev.slice(index)]);
  };

  const updateAuthor = (index: number, newAuthor: string) => {
    const updatedAuthors = [...authors]; // Create shallow copy of the array
    updatedAuthors[index] = newAuthor; // Update the element at index n
    setAuthors(updatedAuthors); // Set the new array to trigger a re-render
  };

  const removeAuthor = (index: number) => {
    setAuthors((prev) =>
      prev.length === 1 ? prev : prev.filter((_, i) => i !== index),
    );
  };

  const handleAddBook = async (book: LibraryBook) => {
    await setIsLoading(true);

    const res = await fetch(`/api/library?id=${book.id}`); // Attempt to search the book to see if it's already in the library.
    const title = book.book_info.volumeInfo.title;

    const data: LibraryBook = await res.json();
    const { available_count, total_count } = data;

    const isBookFound: boolean = res.ok;
    const method = isBookFound ? "PATCH" : "POST"; // If the book is not found, it needs to be added, not updated.
    const body: LibraryBook = {
      ...book,
      available_count: isBookFound ? available_count + 1 : 1,
      total_count: isBookFound ? total_count + 1 : 1,
      updated_at: new Date(),
    };

    await fetch(`/api/library${isBookFound ? `?id=${book.id}` : ""}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(() => {
        toast.success(`"${title}" was successfully added to the library.`, {
          position: "bottom-right",
        });
        clearAllFields();
        setLastUpdated(new Date().toString());
      })
      .catch(() => {
        toast.error(
          `There was an issue adding "${title}" to the library. Please try again.`,
          {
            position: "bottom-right",
          },
        );
      })
      .finally(() => setIsLoading(false));
  };

  if (!isLoaded || !user) return;
  return (
    <div className="flex flex-col gap-5">
      {tab === "Scan" ? (
        <BookScannerWrapper<GoogleBooks.Book>
          book={book}
          setBook={setBook}
          onLookup={handleLookup}
          onScan={handleScan}
          renderBook={(book) => (
            <AdminBookLineItem
              book={book}
              isDisabled={isButtonDisabled}
              onAdd={(options) => {
                const created_at = new Date();
                const siteInfo = getSiteById(options?.site?.id ?? null);
                if (!siteInfo) return;

                const libraryBook: LibraryBook = {
                  id: `${siteInfo.id}_${getPreferredIsbn(book.volumeInfo.industryIdentifiers)}`,
                  book_info: book,
                  site: siteInfo,
                  available_count: 1,
                  total_count: 1,
                  created_at,
                  updated_at: created_at,
                  checkout_history: null,
                };

                handleAddBook(libraryBook);
              }}
              onRemove={() => setBook(null)}
            />
          )}
        />
      ) : (
        <FieldGroup>
          {/* Title */}
          <span className="flex gap-5">
            <Field>
              <FieldLabel htmlFor="site">
                Site
                <Required />
              </FieldLabel>
              <DropdownMenu>
                <DropdownMenuTrigger asChild id="site">
                  <Button
                    variant="outline"
                    className={`flex justify-between ${selectedSite ? "text-foreground" : "text-muted-foreground"}`}
                    disabled={action === "read"}
                  >
                    {selectedSite
                      ? (SITES.find((site) => site.id === selectedSite.id)
                          ?.nickname ?? "Select a site")
                      : "Select a site"}
                    <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <SiteDropdownMenuContent
                  selectedSite={selectedSite}
                  setSelectedSite={setSelectedSite}
                />
              </DropdownMenu>
            </Field>

            <Field>
              <FieldLabel htmlFor="title">
                Title
                <Required />
              </FieldLabel>
              <Input
                id="title"
                placeholder="The Hobbit"
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={action === "read"}
              />
            </Field>
          </span>

          {/* Author */}
          <Field>
            <FieldLabel htmlFor="author">
              Author{authorCount === 1 ? "" : "s"}
              <Required />
            </FieldLabel>

            {Array.from({ length: authorCount }).map((_, i) => (
              <span key={i} className="flex gap-2">
                <Input
                  id="author"
                  placeholder={
                    i === 0 && authorCount === 1
                      ? "J.R.R. Tolkien"
                      : `Author ${i + 1}`
                  }
                  required
                  type="text"
                  value={authors[i]}
                  onChange={(e) => updateAuthor(i, e.target.value)}
                  disabled={action === "read"}
                />
                <Button
                  size="icon"
                  onClick={() => {
                    setAuthorCount((prev) => prev + 1);
                    insertAuthor(i + 1);
                  }}
                  disabled={action === "read"}
                >
                  <Plus />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => {
                    setAuthorCount((prev) => Math.max(1, prev - 1));
                    removeAuthor(i);
                  }}
                  disabled={authorCount === 1 || action === "read"}
                >
                  <X />
                </Button>
              </span>
            ))}
          </Field>

          {/* Date Published & ISBN */}
          <span className="flex gap-5">
            <Field>
              <FieldLabel htmlFor="date">
                Date Published
                <Required />
              </FieldLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className={`justify-start font-normal ${publishedDate ? "" : "text-muted-foreground"}`}
                    disabled={action === "read"}
                  >
                    {publishedDate?.toLocaleDateString("en-US", {
                      timeZone: "UTC",
                    }) ?? "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={publishedDate}
                    defaultMonth={publishedDate}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setPublishedDate(date);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field>
              <FieldLabel htmlFor="isbn">
                ISBN
                <Required />
              </FieldLabel>
              <Input
                id="isbn"
                placeholder="9780547928227"
                required
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                disabled={action === "read"}
              />
            </Field>
          </span>

          {/* Description */}
          <Field>
            <FieldLabel htmlFor="description">
              Description
              <Required />
            </FieldLabel>
            <Textarea
              id="description"
              placeholder="Lorem ipsum dolor sit amet..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={action === "read"}
            />
          </Field>

          {/* Category & Page Count */}
          <span className="flex gap-5">
            <Field>
              <FieldLabel htmlFor="category">
                Category
                <Required />
              </FieldLabel>
              <Input
                id="category"
                placeholder="Fantasy"
                required
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={action === "read"}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="page-count">
                Page Count
                <Required />
              </FieldLabel>
              <Input
                id="page-count"
                placeholder="300"
                required
                type="number"
                min={1}
                value={pageCount}
                onChange={(e) => setPageCount(e.target.value)}
                disabled={action === "read"}
              />
            </Field>
          </span>

          {/* Test Data */}
          <AbacField
            orientation="horizontal"
            user={user}
            action="create"
            resource="test_data"
          >
            <Checkbox
              id="test-data"
              name="test-data"
              checked={isTestData}
              onCheckedChange={() => setIsTestData((prev) => !prev)}
              disabled={action === "read"}
            />
            <FieldLabel htmlFor="test-data">This is test data.</FieldLabel>
          </AbacField>

          {/* Submit Button */}
          {action !== "read" && (
            <Button
              type="submit"
              variant={action === "delete" ? "destructive" : "default"}
              className="w-full molde-button"
              disabled={isLoading || isButtonDisabled}
              onClick={() => {
                if (!selectedSite || !publishedDate) return;

                const book_info: ManualBook = {
                  volumeInfo: {
                    title,
                    authors,
                    publishedDate: publishedDate.toDateString(),
                    description,
                    industryIdentifiers: [
                      {
                        type: isbn.length === 10 ? "ISBN_10" : "ISBN_13",
                        identifier: isbn,
                      },
                    ],
                    pageCount: parseInt(pageCount),
                    categories: [...category.split(",").map((el) => el.trim())],
                  },
                };

                const id = `${isTestData ? "test_" : selectedSite.id + "_"}${isbn}`;
                const created_at = new Date();
                const book: LibraryBook = {
                  id,
                  book_info,
                  site: selectedSite,
                  available_count: 1,
                  total_count: 1,
                  created_at,
                  updated_at: created_at,
                  checkout_history: null,
                };
                handleAddBook(book);
              }}
            >
              {isLoading
                ? actionInfo[action].buttonText.loading
                : actionInfo[action].buttonText.default}{" "}
              book
              {isLoading && <Spinner data-icon="inline-start" />}
            </Button>
          )}
        </FieldGroup>
      )}
    </div>
  );
}
