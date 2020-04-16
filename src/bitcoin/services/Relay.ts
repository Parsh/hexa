import axios, { AxiosInstance, AxiosResponse } from 'axios';
import config from '../Config';

const { RELAY, HEXA_ID, REQUEST_TIMEOUT } = config;
const BH_AXIOS: AxiosInstance = axios.create({
  baseURL: RELAY,
  timeout: REQUEST_TIMEOUT,
});

export default class Relay {
  constructor() {}

  public static fetchReleaseNotes = async (
    build: string,
  ): Promise<{
    releaseNotes: { ios: string; android: string };
  }> => {
    let res: AxiosResponse;
    try {
      res = await BH_AXIOS.post('fetchReleaseNotes', {
        HEXA_ID,
        build,
      });
    } catch (err) {
      if (err.response) throw new Error(err.response.data.err);
      if (err.code) throw new Error(err.code);
    }
    console.log({ res });
    const { releaseNotes } = res.data;
    return { releaseNotes };
  };
}