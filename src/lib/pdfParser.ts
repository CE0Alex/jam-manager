/**
 * PDF Parser Utility
 *
 * This module provides functionality to extract text and data from PDF files
 * using the pdf.js library. It attempts to identify job-related information
 * from the extracted text using regular expressions.
 */

import { JobPriority } from "@/types";
import * as pdfjsLib from "pdfjs-dist";

// Properly set up the PDF.js worker
export const setupPdfWorker = async () => {
  try {
    console.log("Setting up PDF.js worker for version:", pdfjsLib.version);
    
    // In production, use CDN directly
    if (import.meta.env.PROD) {
      const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      console.log("Using PDF.js worker from CDN:", workerUrl);
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
      return true;
    }
    
    // In development, try multiple approaches
    const currentPort = window.location.port;
    console.log(`Current application port: ${currentPort}`);
    
    // Try several approaches to locate the worker
    const possibleWorkerPaths = [
      // Direct CDN path (most reliable)
      `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`,
      // Correct port in development
      `${window.location.protocol}//${window.location.hostname}:${currentPort}/node_modules/pdfjs-dist/build/pdf.worker.min.mjs`,
      // From public directory
      `${window.location.protocol}//${window.location.hostname}:${currentPort}/pdf.worker.min.mjs`,
      // Relative to base URL
      new URL('pdfjs-dist/build/pdf.worker.min.mjs', document.baseURI).href
    ];
    
    // Try each path until one works
    for (const workerPath of possibleWorkerPaths) {
      try {
        console.log(`Trying PDF.js worker at: ${workerPath}`);
        // Check if the worker file exists
        const response = await fetch(workerPath, { method: 'HEAD' });
        if (response.ok) {
          console.log(`PDF.js worker found at: ${workerPath}`);
          pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
          return true;
        }
      } catch (e) {
        console.log(`Worker not found at: ${workerPath}`);
      }
    }
    
    // If all paths failed, use the CDN directly without checking
    console.warn("All worker paths failed, using CDN directly");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    return true;
  } catch (error) {
    console.error("Error setting up PDF.js worker:", error);
    // Fallback to empty string which will use the fake worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    return false;
  }
};

// Initialize the worker immediately
setupPdfWorker().then(success => {
  console.log(`PDF.js worker initialization ${success ? 'successful' : 'failed'}`);
});

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
export const extractTextFromPdf = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check if worker is properly initialized
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      console.warn("PDF.js worker not initialized, attempting to initialize now");
      setupPdfWorker().catch(err => {
        console.error("Failed to initialize PDF.js worker:", err);
      });
    }
    
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        if (!event.target || !event.target.result) {
          throw new Error("Failed to read file");
        }
        
        const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
        
        try {
          console.log("Loading PDF document...");
          // Load the PDF document
          const loadingTask = pdfjsLib.getDocument(typedArray);
          const pdf = await loadingTask.promise;
          
          let fullText = "";
          let debugText = []; // For debugging with original formatting
          
          console.log(`PDF loaded successfully. Document has ${pdf.numPages} pages.`);
          
          // Extract text from each page
          for (let i = 1; i <= pdf.numPages; i++) {
            console.log(`Processing page ${i}/${pdf.numPages}`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            
            // Keep debug info with line positions
            const textItems = textContent.items.map((item: any) => {
              if (item.str) {
                debugText.push(item.str);
              }
              return item.str ? item.str : "";
            });
            
            fullText += textItems.join(" ") + "\n";
          }
          
          // Log the raw extracted text with minimal processing for debugging
          console.log("== RAW PDF TEXT (START) ==");
          console.log(debugText.join("\n"));
          console.log("== RAW PDF TEXT (END) ==");
          
          resolve(fullText);
        } catch (error) {
          console.error("Error processing PDF:", error);
          throw error;
        }
      } catch (error) {
        console.error("Error extracting text from PDF:", error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      reject(new Error("Failed to read the file"));
    };
    
    // Read the file as an array buffer
    reader.readAsArrayBuffer(file);
  });
};

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
  
  // For debugging
  console.log("Normalized text from PDF:", normalizedText);

  // Extract Job Ticket number (often shows as J#### at top right)
  const jobNumberMatch = 
    normalizedText.match(/j(\d{4,5})\b/i) ||
    normalizedText.match(/job#?\s*:\s*(\d+)/i) ||
    normalizedText.match(/job\s+ticket\s+.*?(\d{4,})/i);
    
  if (jobNumberMatch && jobNumberMatch[1]) {
    data.title = `JOB-${jobNumberMatch[1].trim()}`;
  }
  
  // Extract Invoice number (usually labeled as "Invoice #:")
  const invoiceMatch =
    normalizedText.match(/invoice\s*#\s*:\s*(\d+)/i) ||
    normalizedText.match(/invoice\s*#\s*(\d+)/i) ||
    normalizedText.match(/inv\s*#\s*:\s*(\d+)/i);
    
  if (invoiceMatch && invoiceMatch[1]) {
    // If we found an invoice number and no job number, use the invoice number as title
    if (!data.title) {
      data.title = `INV-${invoiceMatch[1].trim()}`;
    } else {
      // Otherwise add it to notes
      data.notes = `Invoice #: ${invoiceMatch[1].trim()}`;
    }
  }
  
  // If we still don't have a title, fallback to filename
  if (!data.title) {
    data.title = fileName
      .replace(/\.pdf$/i, "")
      .replace(/[-_]/g, " ")
      .toUpperCase();
  }

  // Extract Client name (from Bill To/Ship To section)
  const clientMatch =
    normalizedText.match(/bill\s+to\s*:\s*[#]?\d*\s*([a-z0-9\s&,.]+)/i) ||
    normalizedText.match(/ship\s+to\s*:\s*([a-z0-9\s&,.]+)/i) ||
    normalizedText.match(/customer\s*:?\s*([a-z0-9\s&,.]+)/i);
    
  if (clientMatch && clientMatch[1]) {
    data.client = clientMatch[1]
      .trim()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }
  
  // If no client yet, try the contact name
  if (!data.client) {
    const contactMatch = normalizedText.match(/contact\s*:\s*([a-z\s]+)/i);
    if (contactMatch && contactMatch[1]) {
      data.client = contactMatch[1]
        .trim()
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }
  }

  // Extract description (from Description field in Production section)
  const descriptionMatch =
    normalizedText.match(/description\s*:\s*([a-z0-9\s,.]+)(?:\s{2,}|$)/i) ||
    normalizedText.match(/production.*?description\s*:\s*([a-z0-9\s,.]+)/i) ||
    normalizedText.match(/ordered qty.*?description\s*:\s*([a-z0-9\s,.]+)/i);
    
  if (descriptionMatch && descriptionMatch[1]) {
    data.description = descriptionMatch[1].trim()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  // Extract wanted by date (deadline)
  const wantedByMatch =
    normalizedText.match(/wanted\s+by\s*:\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i) ||
    normalizedText.match(/deliver\s+on\s*:\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i) ||
    normalizedText.match(/due\s+date\s*:\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i);
    
  if (wantedByMatch && wantedByMatch[1]) {
    try {
      const dateStr = wantedByMatch[1].trim();
      const [month, day, year] = dateStr.split('/').map(Number);
      
      // Handle 2-digit year (assuming 20xx)
      const fullYear = year < 100 ? 2000 + year : year;
      
      const date = new Date(fullYear, month - 1, day);
      if (!isNaN(date.getTime())) {
        data.deadline = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      }
    } catch (e) {
      console.warn("Failed to parse date:", wantedByMatch[1]);
      // Use default (2 weeks from now)
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

  // Try to extract urgency from text to determine priority
  if (normalizedText.includes("rush") || 
      normalizedText.includes("urgent") || 
      normalizedText.includes("asap")) {
    data.priority = "high";
  } else {
    // Default to medium priority
    data.priority = "medium";
  }

  // Extract estimated hours from time-related fields
  // Look for times in the job ticket form
  const totalTimeMatch = 
    normalizedText.match(/total\s+time\s*:?\s*(\d+\.?\d*)/i) ||
    normalizedText.match(/run\s+time\s*:?\s*(\d+\.?\d*)/i);
  
  if (totalTimeMatch && totalTimeMatch[1]) {
    const hours = parseFloat(totalTimeMatch[1]);
    data.estimatedHours = hours > 0 ? hours : 1;
  } else {
    // Default estimated hours (based on industry standards)
    data.estimatedHours = 2;
  }

  // Compile additional notes from the PDF
  let notes = [];
  
  // Add important details to notes if available
  const qtyMatch = normalizedText.match(/ordered\s+qty\s*:?\s*(\d[\d,]+)/i);
  if (qtyMatch && qtyMatch[1]) {
    notes.push(`Quantity: ${qtyMatch[1].replace(/,/g, '')}`);
  }
  
  const stockMatch = normalizedText.match(/stock\s*:?\s*([a-z0-9#\s]+(?:cover|text|paper)[\w\s]+\d+\s*x\s*\d+)/i);
  if (stockMatch && stockMatch[1]) {
    notes.push(`Stock: ${stockMatch[1].trim()}`);
  }
  
  const colorMatch = normalizedText.match(/color\s*:?\s*([a-z\s]+)/i);
  if (colorMatch && colorMatch[1]) {
    notes.push(`Color: ${colorMatch[1].trim()}`);
  }
  
  const sizeMatch = normalizedText.match(/finish\s+size\s*:?\s*([0-9.]+\s*x\s*[0-9.]+)/i);
  if (sizeMatch && sizeMatch[1]) {
    notes.push(`Size: ${sizeMatch[1].trim()}`);
  }
  
  // Add production notes
  if (notes.length > 0) {
    data.notes = notes.join(' | ');
  } else if (!data.notes) {
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
export const parsePdfJobTicket = async (file: File): Promise<ExtractedJobData> => {
  console.log(`Starting PDF parsing for file: ${file.name}`);
  
  try {
    // Extract text from the PDF
    const text = await extractTextFromPdf(file);
    console.log("Text extraction complete. Length:", text.length);
    
    try {
      // Parse job data from the extracted text
      const jobData = parseJobDataFromText(text, file.name);
      console.log("Extracted job data:", jobData);
      return jobData;
    } catch (parseError) {
      console.error("PDF parsing error:", parseError);
      // Return fallback data based on the filename
      const filename = file.name.split(".")[0];
      return {
        title: filename,
        priority: "medium",
        estimatedHours: 1,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
        notes: "Failed to extract detailed data from PDF. Please fill in the details manually."
      };
    }
  } catch (error) {
    console.error("PDF text extraction error:", error);
    // Return fallback data if extraction fails completely
    const filename = file.name.split(".")[0];
    return {
      title: filename,
      priority: "medium",
      estimatedHours: 1,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
      notes: "Could not read the PDF file. Please fill in the details manually."
    };
  }
};
