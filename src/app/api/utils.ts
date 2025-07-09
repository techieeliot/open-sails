import { writeFile, readFile } from 'fs/promises';

export async function fetchDataByPath(path: string) {
  try {
    const data = await readFile(path, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export async function setDataByPath(path: string, data: any) {
  try {
    await writeFile(path, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
}
