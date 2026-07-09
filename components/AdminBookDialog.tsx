"use client";

import { useAdminContext } from "@/contexts/admin-context";
import { useSites } from "@/hooks/use-sites";
import { PermissionUser } from "@/lib/auth";
import { fetchGoogleBook } from "@/lib/books";
import { getPreferredIsbn, safeParseDate } from "@/lib/utils";
import { getSiteById, Site } from "@/types/cred";
import { Action } from "@/types/data";
import { GoogleBooks, LibraryBook, ManualBook } from "@/types/library";
import { useUser } from "@clerk/nextjs";
import { Info, LibraryBig, Pencil, Plus, Trash, X } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import useSound from "use-sound";
import { AdminCartBookLineItem, AdminScanBookLineItem } from "./BookLineItem";
import { BookScannerWrapper } from "./BookScannerWrapper";
import Required from "./Required";
import SiteSelect from "./SiteSelect";
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
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Spinner } from "./ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";

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
  const [isContinuous, setIsContinuous] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const tabs: ("Scan" | "Manual")[] = ["Scan", "Manual"];

  if (!user) return;
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {actionInfo[action].trigger(user, action, setIsOpen)}
      </DialogTrigger>
      <DialogContent
        className={`${isContinuous ? "max-w-3xl! h-[80vh]" : "max-h-[80vh]"} flex flex-col overflow-y-scroll scrollbar-none`}
        onInteractOutside={(e) => e.preventDefault()}
      >
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
                <TabsTrigger
                  key={tab}
                  value={tab}
                  onClick={() => {
                    if (tab === "Manual") setIsContinuous(false);
                  }}
                >
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
                  isContinuous={isContinuous}
                  setIsContinuous={setIsContinuous}
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
            isContinuous={isContinuous}
            setIsContinuous={setIsContinuous}
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
  isContinuous,
  setIsContinuous,
  setIsDrawerOpen,
  tab,
}: {
  action: Action;
  data?: LibraryBook;
  isContinuous: boolean;
  setIsContinuous: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  tab: "Scan" | "Manual";
}) {
  const { cart, setCart, setLastUpdated } = useAdminContext();
  const { sites } = useSites();
  const { isLoaded, user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [book, setBook] = useState<GoogleBooks.Book | null>(null);
  const [playBeep] = useSound("/sounds/beep.m4a", { volume: 0.5 });

  const handleLookup = async (isbn: string) => {
    const book = await fetchGoogleBook(isbn);
    if (!book) return;
    if (isContinuous) {
      setCart((prev) => [...prev, book]);
    } else {
      setBook(book);
    }
  };

  const handleScan = async (isbn: string) => {
    playBeep();
    await handleLookup(isbn);
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
    const body: LibraryBook[] = [
      {
        ...book,
        available_count: isBookFound ? available_count + 1 : 1,
        total_count: isBookFound ? total_count + 1 : 1,
        updated_at: new Date(),
      },
    ];

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

  const handleUpdateBook = async (book: LibraryBook) => {
    setIsLoading(true);
    const { title } = book.book_info.volumeInfo;

    await fetch(`/api/library?id=${book.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    })
      .then(() => {
        toast.success(`"${title}" was updated successfully.`, {
          position: "bottom-right",
        });
        clearAllFields();
        setLastUpdated(new Date().toString());
      })
      .catch(() => {
        toast.error(
          `There was an issue updating "${title}". Please try again.`,
          { position: "bottom-right" },
        );
      })
      .finally(() => setIsLoading(false));
  };

  const handleDeleteBook = async (book: LibraryBook) => {
    setIsLoading(true);
    const title = book.book_info.volumeInfo.title;

    await fetch(`/api/library?id=${book.id}`, { method: "DELETE" })
      .then(() => {
        toast.success(`"${title}" was removed from the library.`, {
          position: "bottom-right",
        });
        clearAllFields();
        setLastUpdated(new Date().toString());
      })
      .catch(() => {
        toast.error(
          `There was an issue removing "${title}". Please try again.`,
          { position: "bottom-right" },
        );
      })
      .finally(() => setIsLoading(false));
  };

  if (!isLoaded || !user || !sites) return; // TODO: Add a loading and error state.
  return (
    <div className="h-full flex flex-col gap-5">
      {tab === "Scan" ? (
        <div className="w-full h-full flex">
          {isContinuous && (
            <div className="w-80 h-full flex flex-col gap-3 overflow-y-scroll scrollbar-none">
              {cart.length > 0 ? (
                cart.map((book, i) => (
                  <AdminCartBookLineItem book={book} key={i} index={i} />
                ))
              ) : (
                <div className="w-full h-full flex flex-col flex-1 grow justify-center items-center border rounded-xl p-10 bg-muted text-muted-foreground">
                  <LibraryBig className="size-20" />
                  <p className="text-lg font-medium text-muted-foreground mb-5 select-none">
                    No books added yet.
                  </p>
                </div>
              )}
            </div>
          )}
          {isContinuous && (
            <Separator orientation="vertical" decorative className="mx-5" />
          )}
          <div className={`${isContinuous ? "w-1/2" : "w-full"} h-full`}>
            <BookScannerWrapper<GoogleBooks.Book>
              book={book}
              setBook={setBook}
              cart={cart}
              setCart={setCart}
              isContinuous={isContinuous}
              setIsContinuous={setIsContinuous}
              location="admin-scan"
              onLookup={handleLookup}
              onScan={handleScan}
              renderBook={(book) => (
                <AdminScanBookLineItem
                  book={book}
                  isDisabled={isButtonDisabled}
                  onAdd={(options) => {
                    const created_at = new Date();
                    const siteInfo = getSiteById(
                      options?.site?.id ?? null,
                      sites,
                    );
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
              renderButton={isContinuous}
              selectedSite={selectedSite}
              setSelectedSite={setSelectedSite}
              setLastUpdated={setLastUpdated}
            />
          </div>
        </div>
      ) : (
        <FieldGroup>
          {action !== "delete" && (
            <>
              {/* Title */}
              <span className="flex gap-5">
                <Field>
                  <FieldLabel htmlFor="site">
                    Site
                    <Required />
                  </FieldLabel>
                  <SiteSelect
                    selectedSite={selectedSite}
                    setSelectedSite={setSelectedSite}
                    isDisabled={action === "read"}
                  />
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
            </>
          )}
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
                  ...(data?.book_info ?? {}), // This preserves existing GoogleBooks.Book data, if any.
                  volumeInfo: {
                    ...(data?.book_info.volumeInfo ?? {}), // This preserves existing fields for updating books.
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

                const id =
                  data?.id ??
                  `${isTestData ? "test_" : selectedSite.id + "_"}${isbn}`;

                const today = new Date();
                const book: LibraryBook = {
                  id,
                  book_info,
                  site: selectedSite,
                  available_count: data?.available_count ?? 1,
                  total_count: data?.total_count ?? 1,
                  created_at: data?.created_at ?? today,
                  updated_at: today,
                  checkout_history: data?.checkout_history ?? null,
                };

                action === "create"
                  ? handleAddBook(book)
                  : action === "update"
                    ? handleUpdateBook(book)
                    : handleDeleteBook(book);
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
