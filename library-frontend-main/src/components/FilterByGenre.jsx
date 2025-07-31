import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ALL_BOOKS_G } from './queries';
const FilterByGenre = () => {
    const [genre, setGenre] = useState("");
    const allBooks = useQuery(ALL_BOOKS_G, {
        variables: { genre },});
    const [filteredBooks, setFilteredBooks] = useState([]);

    useEffect(() => {
        if (result.data && result.data.allBooks) {
            setFilteredBooks(result.data.allBooks);
        }
    }, [result.data]);

    const handleFilter = (event) => {
        event.preventDefault();
        if (genre) {
            {allBooks }
        } else {
            setFilteredBooks(result.data.allBooks);
        }
    }

}