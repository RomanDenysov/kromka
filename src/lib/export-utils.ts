/* eslint-disable @typescript-eslint/no-explicit-any */
/** biome-ignore-all lint/suspicious/noExplicitAny: Ignore it for now */
"use client";

import { format } from "date-fns";

/**
 * Configuration of a single column in an export.
 * - `key` can be a direct key of the row or a dot-path into nested objects.
 * - `format` can be used to convert raw values to display strings (e.g. cents → currency).
 */
export type ExportColumnConfig<T> = {
  key: keyof T | string;
  header: string;
  format?: (value: any, row: T) => string | number | boolean | null | undefined;
};

export type ExportSheetConfig<T> = {
  name: string;
  rows: T[];
  columns: ExportColumnConfig<T>[];
};

const MAX_EXPORT_ROWS = 10_000;
const SHEET_NAME_MAX_LENGTH = 31;

const escapeCsv = (value: unknown): string => {
  if (value == null) {
    return "";
  }
  const str = String(value);
  // biome-ignore lint/performance/useTopLevelRegex: Ignore it for now
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const getNestedValue = <T>(row: T, key: keyof T | string): unknown => {
  if (typeof key !== "string") {
    return (row as any)[key];
  }
  const parts = key.split(".");
  let current: any = row;
  for (const part of parts) {
    if (current == null) {
      return;
    }
    current = current[part];
  }
  return current;
};

export const buildCsv = <T>(
  rows: T[],
  columns: ExportColumnConfig<T>[]
): string => {
  if (!(rows.length && columns.length)) {
    return "";
  }

  const limitedRows =
    rows.length > MAX_EXPORT_ROWS ? rows.slice(0, MAX_EXPORT_ROWS) : rows;

  const header = columns.map((col) => escapeCsv(col.header)).join(",");

  const data = limitedRows
    .map((row) =>
      columns
        .map((col) => {
          const raw = getNestedValue(row, col.key);
          const formatted =
            col.format != null ? col.format(raw, row) : (raw as unknown);
          return escapeCsv(formatted);
        })
        .join(",")
    )
    .join("\n");

  return `${header}\n${data}`;
};

export const downloadFile = (
  filename: string,
  mime: string,
  data: BlobPart | ArrayBuffer
): void => {
  if (typeof window === "undefined") {
    return;
  }

  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportAsCsv = <T>(
  rows: T[],
  columns: ExportColumnConfig<T>[],
  baseFilename: string
): void => {
  const csv = buildCsv(rows, columns);
  if (!csv) {
    return;
  }

  const timestamp = format(new Date(), "yyyy-MM-dd");
  const filename = `${baseFilename}-${timestamp}.csv`;
  downloadFile(filename, "text/csv;charset=utf-8;", csv);
};

export const exportAsXlsx = async <T>(
  rows: T[],
  columns: ExportColumnConfig<T>[],
  baseFilename: string
): Promise<void> => {
  if (!(rows.length && columns.length) || typeof window === "undefined") {
    return;
  }

  const limitedRows =
    rows.length > MAX_EXPORT_ROWS ? rows.slice(0, MAX_EXPORT_ROWS) : rows;

  const XLSX = await import("xlsx");

  const header = columns.map((c) => c.header);
  const data = limitedRows.map((row) =>
    columns.map((col) => {
      const raw = getNestedValue(row, col.key);
      const formatted =
        col.format != null ? col.format(raw, row) : (raw as unknown);
      return formatted ?? "";
    })
  );

  const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  const timestamp = format(new Date(), "yyyy-MM-dd");
  const filename = `${baseFilename}-${timestamp}.xlsx`;
  downloadFile(
    filename,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    wbout
  );
};

const sanitizeSheetName = (name: string): string => {
  // Excel restrictions:
  // - max 31 chars
  // - cannot contain: : \ / ? * [ ]
  // - cannot be empty
  const cleaned = name
    .replaceAll(":", " ")
    .replaceAll("\\", " ")
    .replaceAll("/", " ")
    .replaceAll("?", " ")
    .replaceAll("*", " ")
    .replaceAll("[", " ")
    .replaceAll("]", " ")
    .trim();
  return (cleaned || "Sheet").slice(0, SHEET_NAME_MAX_LENGTH);
};

export const exportAsXlsxSheets = async (
  sheets: ExportSheetConfig<any>[],
  baseFilename: string
): Promise<void> => {
  if (!sheets.length || typeof window === "undefined") {
    return;
  }

  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();

  for (const sheet of sheets) {
    if (sheet.columns.length === 0 || sheet.rows.length === 0) {
      continue;
    }

    const limitedRows =
      sheet.rows.length > MAX_EXPORT_ROWS
        ? sheet.rows.slice(0, MAX_EXPORT_ROWS)
        : sheet.rows;

    const header = sheet.columns.map((c) => c.header);
    const data = limitedRows.map((row) =>
      sheet.columns.map((col) => {
        const raw = getNestedValue(row, col.key);
        const formatted =
          col.format != null ? col.format(raw, row) : (raw as unknown);
        return formatted ?? "";
      })
    );

    const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      sanitizeSheetName(sheet.name)
    );
  }

  // Ensure we always produce a valid workbook
  if (workbook.SheetNames.length === 0) {
    return;
  }

  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const timestamp = format(new Date(), "yyyy-MM-dd");
  const filename = `${baseFilename}-${timestamp}.xlsx`;
  downloadFile(
    filename,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    wbout
  );
};
