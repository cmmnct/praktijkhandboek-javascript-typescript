import axios from 'axios';
import { CardSet } from '@/models/models';

const API_URL = 'https://my-json-server.typicode.com/cmmnct/cards/cards';

export const fetchCards = async (): Promise<CardSet[]> => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching cards:', error);
    throw error;
  }
};
