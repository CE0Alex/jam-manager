/**
 * PDF Parser Utility
 *
 * This module provides functionality to extract text and data from PDF files
 * using the pdf.js library. It attempts to identify job-related information
 * from the extracted text using regular expressions.
 */

import { JobPriority } from "@/types";
import * as pdfjsLib from "pdfjs-dist";

// Set the worker source path for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractedJobData {
  title?: string;
  client?: string;
  description?: string;
  deadline?: string;
  priority?: JobPriority;
  estimatedHours?: number;
  notes?: string;
}

/**
 * Extract text from a PDF file
 *
 * @param file The PDF file to extract text from
 * @returns A promise that resolves to the extracted text
 */
async function extractTextFromPdf(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async function () {
      try {
        const pdfData = new Uint8Array(reader.result as ArrayBuffer);
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;

        let fullText = "";

        // Extract text from each page
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");
          fullText += pageText + "\n";
        }

        console.log("PDF text extraction successful");
        resolve(fullText);
      } catch (error) {
        console.error("Error extracting text from PDF:", error);
        reject(error);
      }
    };

    reader.onerror = function () {
      console.error("Error reading file");
      reject(new Error("Error reading file"));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse extracted text to identify job information
 *
 * @param text The text extracted from the PDF
 * @param fileName The name of the PDF file (used as fallback for title)
 * @returns Extracted job data
 */
function parseJobDataFromText(
  text: string,
  fileName: string,
): ExtractedJobData {
  const data: ExtractedJobData = {};

  // Normalize text for easier parsing
  const normalizedText = text.replace(/\s+/g, " ").toLowerCase();

  // Extract invoice number (located in the top right of the PDF)
  const invoiceMatch =
    normalizedText.match(
      /invoice\s*(?:#|number|no|num)?[:\s]*(\w[\w\s-]*\d+)(?:\s|$)/i,
    ) ||
    normalizedText.match(
      /inv\s*(?:#|number|no|num)?[:\s]*(\w[\w\s-]*\d+)(?:\s|$)/i,
    );
  if (invoiceMatch && invoiceMatch[1]) {
    data.title = invoiceMatch[1].trim().toUpperCase();
  } else {
    // Use filename as fallback, removing extension and formatting
    data.title = fileName
      .replace(/\.pdf$/i, "")
      .replace(/[-_]/g, " ")
      .toUpperCase();
  }

  // Extract contact information
  const contactMatch =
    normalizedText.match(/contact[:\s]+(\w[\w\s&,.@-]+)(?:\s|$)/i) ||
    normalizedText.match(/attention[:\s]+(\w[\w\s&,.@-]+)(?:\s|$)/i) ||
    normalizedText.match(/attn[:\s]+(\w[\w\s&,.@-]+)(?:\s|$)/i);
  if (contactMatch && contactMatch[1]) {
    data.client = contactMatch[1]
      .trim()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  // Extract description from the production section
  const productionDescMatch =
    normalizedText.match(
      /production[\s\S]*?description[:\s]+(\w[\w\s,.]+?)(?:\s{2,}|$)/i,
    ) ||
    normalizedText.match(
      /production[\s\S]*?details[:\s]+(\w[\w\s,.]+?)(?:\s{2,}|$)/i,
    );
  if (productionDescMatch && productionDescMatch[1]) {
    data.description = productionDescMatch[1].trim();
  } else {
    // Fallback to general description if production-specific not found
    const descMatch =
      normalizedText.match(/description[:\s]+(\w[\w\s,.]+?)(?:\s{2,}|$)/i) ||
      normalizedText.match(/details[:\s]+(\w[\w\s,.]+?)(?:\s{2,}|$)/i);
    if (descMatch && descMatch[1]) {
      data.description = descMatch[1].trim();
    }
  }

  // Extract wanted by date
  const wantedByMatch =
    normalizedText.match(
      /wanted\s*by[:\s]+(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})/i,
    ) ||
    normalizedText.match(/need\s*by[:\s]+(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})/i) ||
    normalizedText.match(
      /required\s*by[:\s]+(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})/i,
    );
  if (wantedByMatch && wantedByMatch[1]) {
    try {
      // Attempt to parse the date
      const dateParts = wantedByMatch[1].split(/[\/\-]/);
      let year, month, day;

      // Handle different date formats (MM/DD/YYYY or DD/MM/YYYY)
      if (dateParts[2].length === 4) {
        // Assuming MM/DD/YYYY or DD/MM/YYYY
        year = parseInt(dateParts[2]);
        month = parseInt(dateParts[0]);
        day = parseInt(dateParts[1]);

        // Validate month (if > 12, assume DD/MM/YYYY format)
        if (month > 12) {
          day = parseInt(dateParts[0]);
          month = parseInt(dateParts[1]);
        }
      } else {
        // Assuming MM/DD/YY or DD/MM/YY
        year = 2000 + parseInt(dateParts[2]); // Assume 20xx for 2-digit years
        month = parseInt(dateParts[0]);
        day = parseInt(dateParts[1]);

        // Validate month (if > 12, assume DD/MM/YY format)
        if (month > 12) {
          day = parseInt(dateParts[0]);
          month = parseInt(dateParts[1]);
        }
      }

      // Create date and format as YYYY-MM-DD for the form
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        data.deadline = date.toISOString().split("T")[0];
      }
    } catch (e) {
      console.warn("Failed to parse date:", wantedByMatch[1]);
      // Use a default deadline (2 weeks from now) if date parsing fails
      data.deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
    }
  } else {
    // Fallback to other date formats if wanted by not found
    const dateMatch =
      normalizedText.match(
        /deadline[:\s]+(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})/i,
      ) ||
      normalizedText.match(/due[:\s]+(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})/i) ||
      normalizedText.match(/(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})/i);
    if (dateMatch && dateMatch[1]) {
      try {
        // Attempt to parse the date
        const dateParts = dateMatch[1].split(/[\/\-]/);
        let year, month, day;

        // Handle different date formats (MM/DD/YYYY or DD/MM/YYYY)
        if (dateParts[2].length === 4) {
          // Assuming MM/DD/YYYY or DD/MM/YYYY
          year = parseInt(dateParts[2]);
          month = parseInt(dateParts[0]);
          day = parseInt(dateParts[1]);

          // Validate month (if > 12, assume DD/MM/YYYY format)
          if (month > 12) {
            day = parseInt(dateParts[0]);
            month = parseInt(dateParts[1]);
          }
        } else {
          // Assuming MM/DD/YY or DD/MM/YY
          year = 2000 + parseInt(dateParts[2]); // Assume 20xx for 2-digit years
          month = parseInt(dateParts[0]);
          day = parseInt(dateParts[1]);

          // Validate month (if > 12, assume DD/MM/YY format)
          if (month > 12) {
            day = parseInt(dateParts[0]);
            month = parseInt(dateParts[1]);
          }
        }

        // Create date and format as YYYY-MM-DD for the form
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          data.deadline = date.toISOString().split("T")[0];
        }
      } catch (e) {
        console.warn("Failed to parse date:", dateMatch[1]);
        // Use a default deadline (2 weeks from now) if date parsing fails
        data.deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
      }
    } else {
      // Default deadline (2 weeks from now)
      data.deadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
    }
  }

  // Extract priority (look for "priority:" followed by level)
  const priorityMatch = normalizedText.match(/priority[:\s]+(\w+)/i);
  if (priorityMatch && priorityMatch[1]) {
    const priority = priorityMatch[1].toLowerCase();
    if (priority.includes("high") || priority.includes("urgent")) {
      data.priority = "high";
    } else if (priority.includes("med")) {
      data.priority = "medium";
    } else if (priority.includes("low")) {
      data.priority = "low";
    } else {
      data.priority = "medium"; // Default
    }
  } else {
    data.priority = "medium"; // Default
  }

  // Extract estimated hours (look for "hours:" or "estimated:")
  const hoursMatch =
    normalizedText.match(/hours[:\s]+(\d+(\.\d+)?)/i) ||
    normalizedText.match(/estimated[:\s]+(\d+(\.\d+)?)/i);
  if (hoursMatch && hoursMatch[1]) {
    data.estimatedHours = parseFloat(hoursMatch[1]);
  } else {
    data.estimatedHours = 2; // Default
  }

  // Extract notes or additional information
  const notesMatch =
    normalizedText.match(/notes[:\s]+(\w[\w\s,.]+?)(?:\s{2,}|$)/i) ||
    normalizedText.match(/comments[:\s]+(\w[\w\s,.]+?)(?:\s{2,}|$)/i);
  if (notesMatch && notesMatch[1]) {
    data.notes = notesMatch[1].trim();
  } else {
    data.notes = `Extracted from ${fileName}. Some fields may need manual review.`;
  }

  return data;
}

/**
 * Parse a PDF file and extract job information
 *
 * @param file The PDF file to parse
 * @returns A promise that resolves to the extracted job data
 */
export async function parsePdfJobTicket(file: File): Promise<ExtractedJobData> {
  console.log(`Starting PDF parsing for file: ${file.name}`);

  try {
    // Extract text from the PDF
    const extractedText = await extractTextFromPdf(file);
    console.log("Text extraction complete, parsing job data...");

    // Parse job data from the extracted text
    const jobData = parseJobDataFromText(extractedText, file.name);
    console.log("Job data parsed successfully:", jobData);

    return jobData;
  } catch (error) {
    console.error("PDF parsing failed:", error);

    // Return fallback data based on filename
    const fallbackData: ExtractedJobData = {
      title: file.name
        .replace(/\.pdf$/i, "")
        .replace(/[-_]/g, " ")
        .toUpperCase(),
      client: "",
      description: "",
      priority: "medium",
      estimatedHours: 2,
      notes: `Failed to extract data from PDF. Please fill in the details manually.`,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 2 weeks from now
    };

    return fallbackData;
  }
}
