import { DATABASE_NAMES } from "../common/constants";

import * as fs from "fs";
import * as path from "path";
import iconv from "iconv-lite";
import Papa from "papaparse";
// CSV
export const getFilePath = (dir: string, fileName: string): string => {
  return path.join(dir, fileName);
};
export const readCsvFile = (filePath: string): string[][] =>
  Papa.parse<string[]>(fs.readFileSync(filePath, "utf-8"), {
    skipEmptyLines: true,
  }).data;

const toPostgresArray = (values: string[] | undefined): string | undefined => {
  if (!values || !Array.isArray(values)) {
    return undefined; // 配列でない場合はそのまま
  }
  return `{${values.map((value) => value.replace(/"/g, '\\"')).join(",")}}`;
};
const writeCsvFile = (
  data: unknown[],
  fileName: string,
  OUTPUT_CSV_DIR: string
): void => {
  const transformedData = data.map((row) => {
    if (typeof row === "object" && row !== null) {
      return Object.fromEntries(
        Object.entries(row).map(([key, value]) => {
          if (key === "options" && Array.isArray(value)) {
            return [key, toPostgresArray(value)];
          } else if (key === "value" && Array.isArray(value)) {
            return [key, toPostgresArray(value)];
          }
          return [key, value];
        })
      );
    }
    return row;
  });

  const csvContent = Papa.unparse(transformedData);
  const filePath = getFilePath(OUTPUT_CSV_DIR, fileName);
  fs.writeFileSync(filePath, csvContent, "utf-8");
};
export const writeCsvFiles = (
  dataMap: { [key: string]: any[] },
  outputDir: string
) => {
  Object.entries(dataMap).forEach(([tableName, data]) => {
    writeCsvFile(data, `${tableName}.csv`, outputDir);
  });
};

export const clearDirectory = (dirPath: string) => {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const filePath = path.join(dirPath, file);
      fs.unlinkSync(filePath);
    });
  } else {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// CSVのヘッダーとボディをKeyValueに整形
export const getRowToKeyValue = (header: string[], row: string[]) => {
  console.log(header, row);
  if (header.length !== row.length) {
    console.error("ヘッダーとコンテンツマッチしていない");
    return null;
  }
  return header.reduce((acc, key, index) => {
    acc[key] = row[index];
    return acc;
  }, {} as Record<string, string>);
};

// 画像
const getMimeTypeFromExtension = (extension: string) => {
  const mimeTypes: { [key: string]: string } = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".bmp": "image/bmp",
    ".webp": "image/webp",
    ".tiff": "image/tiff",
    ".svg": "image/svg+xml",
  };

  return mimeTypes[extension] || "application/octet-stream";
};
export const getImageInfo = (INPUT_IMAGE_DIR: string, file: string) => {
  const img = path.join(INPUT_IMAGE_DIR, file);
  const size = fs.statSync(img).size;
  const fileName = path.basename(img);
  const ext = path.extname(file).toLowerCase();
  const mimeType = getMimeTypeFromExtension(ext);
  return { ext, size, fileName, mimeType };
};
export const copyFileToOutput = (
  OUTPUT_IMAGE_DIR: string,
  fileName: string,
  src: string
): void => {
  const newPath = path.join(OUTPUT_IMAGE_DIR, fileName);

  fs.copyFile(src, newPath, (err) => {
    if (err) {
      console.error(`リネーム時エラーが発生: ${err.message}`);
    }
  });
};

// コマンド
const printLocalCommands = (
  outCsvFiles: string[],
  columnsList: string[][],
  OUTPUT_CSV_DIR: string
): void => {
  const OUT_CSV_DIRECTORY = "/tmp/hoppa_to_coreda_csvs";

  console.log("## ローカルの PostgreSQL docker へ実行する \\copy コマンド ##");
  console.log(`docker-compose exec db rm -r ${OUT_CSV_DIRECTORY}`);
  console.log(`docker-compose cp ${OUTPUT_CSV_DIR} db:${OUT_CSV_DIRECTORY}`);
  console.log("");
  console.log(
    "docker-compose exec db psql -d test-data -c 'TRUNCATE TABLE taxonomies RESTART IDENTITY CASCADE;'"
  );
  console.log(
    "docker-compose exec db psql -d test-data -c 'TRUNCATE TABLE content_settings RESTART IDENTITY CASCADE;'"
  );
  console.log("");

  outCsvFiles.forEach((fileName, index) => {
    const filePath = path.join(OUT_CSV_DIRECTORY, fileName);
    const tableName = fileName.replace(".csv", "");
    const columns = columnsList[index].join(",");
    const commandStr = `\\copy ${tableName}(${columns}) FROM '${filePath}' WITH DELIMITER ',' CSV HEADER;`;
    console.log(
      `docker-compose exec db psql -d test-data -c \"${commandStr}\"`
    );
  });
};
export const populateCsvAndColumns = (OUTPUT_CSV_DIR: string) => {
  const outCsvFiles: string[] = [];
  const columnsList: string[][] = [];
  Object.values(DATABASE_NAMES).forEach((tableName) => {
    const fileName = `${tableName}.csv`;
    const headerRow = readCsvFile(getFilePath(OUTPUT_CSV_DIR, fileName));
    if (headerRow[0]) {
      outCsvFiles.push(fileName);
      columnsList.push(headerRow[0]);
    }
  });
  printLocalCommands(outCsvFiles, columnsList, OUTPUT_CSV_DIR);
};
