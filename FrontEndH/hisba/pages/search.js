import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../lib/axios';
import styles from '../styles/SearchResults.module.css';

const SearchResults = () => {
    const router = useRouter();
    const { query } = router.query;
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (query) {
            axiosInstance.get(`/search/?q=${query}`)
                .then(response => {
                    if (response.data.results.length > 0) {
                        setResults(response.data.results);
                    } else {
                        setResults([]);
                    }
                })
                .catch(error => {
                    console.error('Failed to fetch search results:', error);
                    setResults([]);
                });
        }
    }, [query]);

    return (
        <div className={styles.searchResultsContainer}>
            <h1>Search Results for "{query}"</h1>
            {results.length > 0 ? (
                <ul className={styles.resultsList}>
                    {results.map((result, index) => (
                        <li key={index} className={styles.resultItem} onClick={() => router.push(result.url)}>
                            {result.image && <img src={result.image} alt={result.name} />}
                            <div className={styles.resultInfo}>
                                <p className={styles.resultName}>{result.name}</p>
                                {result.price && <p className={styles.resultPrice}>Price: ${result.price}</p>}
                                {result.rating && <p className={styles.resultRating}>Rating: {result.rating} stars</p>}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No results found</p>
            )}
        </div>
    );
};

export default SearchResults;
