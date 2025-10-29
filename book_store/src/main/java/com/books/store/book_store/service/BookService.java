package com.books.store.book_store.service;

import com.books.store.book_store.entity.Book;
import com.books.store.book_store.exceptions.BookNotFoundException;
import com.books.store.book_store.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public Book createBook(Book book) {
        validateBook(book);
        return bookRepository.save(book);
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book getBookById(int id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new BookNotFoundException("Book not found with id: " + id));
    }

    public Book updateBook(int id, Book bookDetails) {
        Book existingBook = getBookById(id); // throws exception if not found

        existingBook.setTitle(bookDetails.getTitle());
        existingBook.setAuthor(bookDetails.getAuthor());
        existingBook.setPrice(bookDetails.getPrice());
        existingBook.setImageUrl(bookDetails.getImageUrl());

        return bookRepository.save(existingBook);
    }

    public void deleteBook(int id) {
        Book book = getBookById(id); // verify it exists
        bookRepository.delete(book);
    }

    public List<Book> getBooksByAuthor(String author) {
        return bookRepository.findByAuthor(author);
    }

    public List<Book> searchBooks(String keyword) {
        return bookRepository.findByTitleContaining(keyword);
    }

    public List<Book> getBooksByPriceRange(double minPrice, double maxPrice) {
        if (minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) {
            throw new IllegalArgumentException("Invalid price range");
        }
        return bookRepository.findByPriceBetween(minPrice, maxPrice);
    }

    private void validateBook(Book book) {
        if (book.getTitle() == null || book.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Book title cannot be empty");
        }
        if (book.getPrice() < 0) {
            throw new IllegalArgumentException("Book price cannot be negative");
        }
    }
}
