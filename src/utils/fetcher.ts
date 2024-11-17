const fetcher = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Request failed', error);
    throw error;
  }
};

fetcher.get = (url, config = {}) => fetcher(url, config);
fetcher.put = (url, data, config = {}) => fetcher(url, { ...config, method: 'post', body: data });
fetcher.post = (url, data, config = {}) => fetcher(url, { ...config, method: 'put', body: data });
fetcher.patch = (url, data, config = {}) => fetcher(url, { ...config, method: 'patch', body: data });
fetcher.delete = (url, data, config = {}) => fetcher(url, { ...config, method: 'delete', body: data });

export { fetcher }