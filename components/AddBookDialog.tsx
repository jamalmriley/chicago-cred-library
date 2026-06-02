"use client";

import { useAdminContext } from "@/contexts/admin-context";
import { Site, SITES } from "@/types/cred";
import { LibraryBook, ManualBook } from "@/types/library";
import { useUser } from "@clerk/nextjs";
import { BookPlus, ChevronDown, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Required from "./Required";
import SiteDropdownMenuContent from "./SiteDropdownMenuContent";
import { AbacButton, AbacField } from "./ui/abac";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Card } from "./ui/card";
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
import { Textarea } from "./ui/textarea";

export default function AddBookDialog() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return;
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <AbacButton user={user} action="create" resource="books">
          <BookPlus />
          Add book
        </AbacButton>
      </DialogTrigger>
      <DialogContent className="max-h-[75vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add a book</DialogTitle>
          <DialogDescription>Fill out the information below.</DialogDescription>
        </DialogHeader>
        <AddBookForm setIsDrawerOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  );
}

function AddBookForm({
  setIsDrawerOpen,
}: {
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { setLastUpdated } = useAdminContext();
  const { isLoaded, user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

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
    (isbn.length !== 10 && isbn.length !== 13) ||
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

    const body: LibraryBook = {
      ...book,
      available_count: res.ok ? available_count + 1 : 1,
      total_count: res.ok ? total_count + 1 : 1,
      updated_at: new Date(),
    };

    const method = res.ok ? "PATCH" : "POST"; // If the book is not found, it needs to be added, not updated.
    await fetch(`/api/library${res.ok ? `?id=${book.id}` : ""}`, {
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
    <Card className="flex-1 min-h-0 overflow-y-auto p-5">
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
                          JSON.stringify(site) === JSON.stringify(selectedSite),
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
      </FieldGroup>

      {/* Submit Button */}
      <Field orientation="horizontal">
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
      </Field>
    </Card>
  );
}
