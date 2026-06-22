export type Month =
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November"
  | "December";

export interface ChartDatum {
  label: string;
  value: number;
  value2?: number;
  value3?: number;
  fill?: string;
}

export type ChartData = ChartDatum[];

export type Action = "create" | "read" | "update" | "delete";
