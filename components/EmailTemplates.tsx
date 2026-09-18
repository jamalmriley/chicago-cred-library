import { toBookDisplayInfo } from "@/lib/utils";
import { Participant } from "@/types/cred";
import { CheckoutItem } from "@/types/library";
import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Text,
} from "@react-email/components";
import { format, formatRelative } from "date-fns";
import { BookMarked } from "lucide-react";

interface EmailTemplateProps {
  books: CheckoutItem[];
  participant: Participant;
}

export function CheckoutEmail({ books, participant }: EmailTemplateProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        We hope you enjoy your {books.length === 1 ? "book" : "books"}!
      </Preview>
      <Body
        style={{ backgroundColor: "#fafafa", fontFamily: "Arial, sans-serif" }}
      >
        <Container
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            padding: "32px",
          }}
        >
          <Text style={{ fontSize: "15px", color: "#222" }}>
            Hi, {participant.first_name}!
          </Text>
          <Text style={{ fontSize: "15px", color: "#222" }}>
            Thanks for visiting the Chicago CRED Library. Below is a receipt for
            your checked out {books.length === 1 ? "book" : "books"}.
          </Text>
          <Hr style={{ borderColor: "#ebebeb", margin: "20px 0" }} />

          {books.map((item, index) => {
            const info = toBookDisplayInfo(item.book);
            return (
              <Row key={index} style={{ marginBottom: "16px" }}>
                <Column style={{ width: "64px" }}>
                  {info.thumbnail ? (
                    <Img
                      src={info.thumbnail}
                      width={56}
                      height={56}
                      alt={info.title}
                      style={{ borderRadius: "4px" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        background: "#f0f0f0",
                        borderRadius: "4px",
                        margin: "0px auto",
                      }}
                    >
                      <BookMarked />
                    </div>
                  )}
                </Column>
                <Column style={{ paddingLeft: "16px" }}>
                  <Text
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "#111",
                    }}
                  >
                    {info.title}
                  </Text>
                  <Text
                    style={{
                      margin: 0,
                      fontSize: "11px",
                      color: "#888",
                      fontStyle: "italic",
                    }}
                  >
                    {info.authors?.join(", ")}
                  </Text>
                </Column>
              </Row>
            );
          })}

          <Hr style={{ borderColor: "#ebebeb", margin: "20px 0" }} />
          <Text style={{ fontSize: "14px", color: "#222" }}>
            {books.length === 1 ? "This book is" : "These books are"} due{" "}
            <strong>{format(books[0].due_date, "eeee, MMMM d, yyyy")}</strong>.
            If you have any questions, please reply to this email or reach out
            to your tutor.
          </Text>
          <Text style={{ fontSize: "14px", color: "#222" }}>
            Sincerely,
            <br />
            The CRED Education Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function ReminderEmail({ books, participant }: EmailTemplateProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        Don't forget to return your {books.length === 1 ? "book" : "books"}!
      </Preview>
      <Body
        style={{ backgroundColor: "#fafafa", fontFamily: "Arial, sans-serif" }}
      >
        <Container
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            padding: "32px",
          }}
        >
          <Text style={{ fontSize: "15px", color: "#222" }}>
            Hi, {participant.first_name}!
          </Text>
          <Text style={{ fontSize: "15px", color: "#222" }}>
            As a reminder, your {books.length === 1 ? "book is" : "books are"}{" "}
            due soon.
            {/* due {formatRelative(books[0].due_date, new Date())}. */}
          </Text>
          <Hr style={{ borderColor: "#ebebeb", margin: "20px 0" }} />

          {books.map((item, index) => {
            const info = toBookDisplayInfo(item.book);
            return (
              <Row key={index} style={{ marginBottom: "16px" }}>
                <Column style={{ width: "64px" }}>
                  {info.thumbnail ? (
                    <Img
                      src={info.thumbnail}
                      width={56}
                      height={56}
                      alt={info.title}
                      style={{ borderRadius: "4px" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        background: "#f0f0f0",
                        borderRadius: "4px",
                        margin: "0px auto",
                      }}
                    >
                      <BookMarked />
                    </div>
                  )}
                </Column>
                <Column style={{ paddingLeft: "16px" }}>
                  <Text
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "#111",
                    }}
                  >
                    {info.title}
                  </Text>
                  <Text
                    style={{
                      margin: 0,
                      fontSize: "11px",
                      color: "#888",
                      fontStyle: "italic",
                    }}
                  >
                    {info.authors?.join(", ")}
                  </Text>
                </Column>
              </Row>
            );
          })}

          <Hr style={{ borderColor: "#ebebeb", margin: "20px 0" }} />
          <Text style={{ fontSize: "14px", color: "#222" }}>
            {books.length === 1 ? "This book is" : "These books are"} due{" "}
            <strong>soon</strong>. Please return them directly to your tutor or
            the library book return are. If you have any questions, please reply
            to this email or reach out to your tutor.
          </Text>
          <Text style={{ fontSize: "14px", color: "#222" }}>
            Sincerely,
            <br />
            The CRED Education Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function ReturnEmail({ books, participant }: EmailTemplateProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        Thanks for returning your {books.length === 1 ? "book" : "books"}!
      </Preview>
      <Body
        style={{ backgroundColor: "#fafafa", fontFamily: "Arial, sans-serif" }}
      >
        <Container
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            padding: "32px",
          }}
        >
          <Text style={{ fontSize: "15px", color: "#222" }}>
            Hi, {participant.first_name}!
          </Text>
          <Text style={{ fontSize: "15px", color: "#222" }}>
            Thanks for visiting the Chicago CRED Library. Below is a receipt for
            your returned {books.length === 1 ? "book" : "books"}.
          </Text>
          <Hr style={{ borderColor: "#ebebeb", margin: "20px 0" }} />

          {books.map((item, index) => {
            const info = toBookDisplayInfo(item.book);
            return (
              <Row key={index} style={{ marginBottom: "16px" }}>
                <Column style={{ width: "64px" }}>
                  {info.thumbnail ? (
                    <Img
                      src={info.thumbnail}
                      width={56}
                      height={56}
                      alt={info.title}
                      style={{ borderRadius: "4px" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        background: "#f0f0f0",
                        borderRadius: "4px",
                        margin: "0px auto",
                      }}
                    >
                      <BookMarked />
                    </div>
                  )}
                </Column>
                <Column style={{ paddingLeft: "16px" }}>
                  <Text
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "#111",
                    }}
                  >
                    {info.title}
                  </Text>
                  <Text
                    style={{
                      margin: 0,
                      fontSize: "11px",
                      color: "#888",
                      fontStyle: "italic",
                    }}
                  >
                    {info.authors?.join(", ")}
                  </Text>
                </Column>
              </Row>
            );
          })}

          <Hr style={{ borderColor: "#ebebeb", margin: "20px 0" }} />
          <Text style={{ fontSize: "14px", color: "#222" }}>
            {books.length === 1 ? "This book is" : "These books are"} due{" "}
            <strong>{format(books[0].due_date, "eeee, MMMM d, yyyy")}</strong>.
            Feel free to check out more books! If you have any questions, please
            reply to this email or reach out to your tutor.
          </Text>
          <Text style={{ fontSize: "14px", color: "#222" }}>
            Sincerely,
            <br />
            The CRED Education Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
