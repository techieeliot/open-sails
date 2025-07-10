import { writeFile, readFile } from 'fs/promises';

export async function fetchDataByPath(path: string) {
  try {
    const data = await readFile(path, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error as Error;
  }
}

export async function setDataByPath(path: string, data: unknown) {
  try {
    await writeFile(path, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
    throw error as Error;
  }
}
