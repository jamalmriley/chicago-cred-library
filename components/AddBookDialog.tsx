"use client";

import { useAdminContext } from "@/contexts/admin-context";
import { fetchGoogleBook } from "@/lib/books";
import { getPreferredIsbn } from "@/lib/utils";
import { getSiteById, Site, SITES } from "@/types/cred";
import { GoogleBooks, LibraryBook, ManualBook } from "@/types/library";
import { useUser } from "@clerk/nextjs";
import { ChevronDown, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSound from "use-sound";
import { AdminBookLineItem } from "./BookLineItem";
import { BookScannerWrapper } from "./BookScannerWrapper";
import Required from "./Required";
import SiteDropdownMenuContent from "./SiteDropdownMenuContent";
import { AbacButton, AbacField } from "./ui/abac";
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

export default function AddBookDialog() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const tabs = ["Scan", "Manual"];

  if (!user) return;
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <AbacButton
          user={user}
          action="create"
          resource="books"
          className="molde-button"
        >
          <Plus />
          Add book
        </AbacButton>
      </DialogTrigger>
      <DialogContent className="max-h-[75vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add a book</DialogTitle>
          <DialogDescription>
            Scan or fill out the book's information below.
          </DialogDescription>
        </DialogHeader>

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
              <AddBookForm tab={tab} setIsDrawerOpen={setIsOpen} />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function AddBookForm({
  tab,
  setIsDrawerOpen,
}: {
  tab: string;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
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

  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState<string[]>([""]);
  const [authorCount, setAuthorCount] = useState(1);
  const [open, setOpen] = useState(false);
  const [publishedDate, setPublishedDate] = useState<Date | undefined>(
    undefined,
  );
  const [isbn, setIsbn] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [pageCount, setPageCount] = useState("");

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
      ) : tab === "Manual" ? (
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
                  >
                    {selectedSite
                      ? SITES.filter(
                          (site) =>
                            JSON.stringify(site) ===
                            JSON.stringify(selectedSite),
                        )[0].nickname
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
                />
                <Button
                  size="icon"
                  onClick={() => {
                    setAuthorCount((prev) => prev + 1);
                    insertAuthor(i + 1);
                  }}
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
                  disabled={authorCount === 1}
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
                  >
                    {publishedDate
                      ? publishedDate.toLocaleDateString()
                      : "Select date"}
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
            />
            <FieldLabel htmlFor="test-data">This is test data.</FieldLabel>
          </AbacField>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
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
            {isLoading ? "Adding book..." : "Add book"}
            {isLoading && <Spinner data-icon="inline-start" />}
          </Button>
        </FieldGroup>
      ) : (
        <></>
      )}
    </div>
  );
}
