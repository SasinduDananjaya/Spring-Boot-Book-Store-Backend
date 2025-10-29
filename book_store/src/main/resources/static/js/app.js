const API_BASE_URL = 'http://localhost:8080/api';

let allBooks = [];
let isEditMode = false;

//load books on page load
document.addEventListener('DOMContentLoaded', () => {
    loadBooks();
    setupSearch();
    setupModalClickOutside();
    setupBookForm();
});

// get all books from API
async function loadBooks() {
    try {
        const response = await fetch(`${API_BASE_URL}/books`);
        if (!response.ok) throw new Error('Failed to fetch books');

        allBooks = await response.json();
        displayBooks(allBooks);
    } catch (error) {
        console.error('Error loading books:', error);
        showNotification('Error loading books. Make sure the API is running.', 'error');
        document.getElementById('booksContainer').innerHTML = `
            <div class="empty-state">
                <h2>Unable to connect to API</h2>
                <p>Please ensure your backend server is running at ${API_BASE_URL}</p>
            </div>
        `;
    }
}

//show books in grid view
function displayBooks(books) {
    const container = document.getElementById('booksContainer');

    if (books.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>No books found</h2>
                <p>Start by adding your first book to the inventory!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = books.map(book => `
        <div class="book-card">
            <div class="book-image-container">
                ${book.imageUrl ?
        `<img src="${book.imageUrl}" alt="${book.title}" class="book-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                     <div class="book-image-placeholder" style="display:none;">📖</div>` :
        `<div class="book-image-placeholder">📖</div>`
    }
            </div>
            <div class="book-content">
                <div class="book-title">${escapeHtml(book.title)}</div>
                <div class="book-author">by ${escapeHtml(book.author)}</div>
                <div class="book-price">$${book.price.toFixed(2)}</div>
                <div class="book-actions">
                    <button class="btn-update" onclick="openEditModal(${book.id})">✏️ Update</button>
                    <button class="btn-delete" onclick="deleteBook(${book.id})">🗑️ Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

//open modal for adding a new book
function openAddModal() {
    isEditMode = false;
    document.getElementById('modalTitle').textContent = 'Add New Book';
    document.getElementById('bookForm').reset();
    document.getElementById('bookId').value = '';
    document.getElementById('bookModal').classList.add('active');
}

//open modal for editing a book
function openEditModal(bookId) {
    isEditMode = true;
    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;

    document.getElementById('modalTitle').textContent = 'Update Book';
    document.getElementById('bookId').value = book.id;
    document.getElementById('title').value = book.title;
    document.getElementById('author').value = book.author;
    document.getElementById('price').value = book.price;
    document.getElementById('imageUrl').value = book.imageUrl || '';
    document.getElementById('bookModal').classList.add('active');
}

//close modal
function closeModal() {
    document.getElementById('bookModal').classList.remove('active');
}

//Book form submission
function setupBookForm() {
    document.getElementById('bookForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const bookData = {
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            price: parseFloat(document.getElementById('price').value),
            imageUrl: document.getElementById('imageUrl').value || null
        };

        try {
            if (isEditMode) {
                const bookId = document.getElementById('bookId').value;
                await updateBook(bookId, bookData);
            } else {
                await createBook(bookData);
            }

            closeModal();
            loadBooks();
        } catch (error) {
            console.error('Error saving book:', error);
            showNotification('Error saving book. Please try again.', 'error');
        }
    });
}

//create a new book
async function createBook(bookData) {
    const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookData)
    });

    if (!response.ok) throw new Error('Failed to create book');
    showNotification('Book added successfully!', 'success');
}

//update a book
async function updateBook(bookId, bookData) {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookData)
    });

    if (!response.ok) throw new Error('Failed to update book');
    showNotification('Book updated successfully!', 'success');
}

//delete a book
async function deleteBook(bookId) {
    if (!confirm('Are you sure you want to delete this book?')) {
        return;
    }

    try {
        const book = allBooks.find(b => b.id === bookId);
        if (!book) throw new Error('Book not found');

        const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(book)
        });

        if (!response.ok) throw new Error('Failed to delete book');

        showNotification('Book deleted successfully!', 'success');
        loadBooks();
    } catch (error) {
        console.error('Error deleting book:', error);
        showNotification('Error deleting book. Please try again.', 'error');
    }
}

// search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredBooks = allBooks.filter(book =>
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.price.toString().includes(searchTerm)
        );
        displayBooks(filteredBooks);
    });
}

//show notification
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} active`;

    setTimeout(() => {
        notification.classList.remove('active');
    }, 3000);
}

//prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

//close modal when clicking outside of the page
function setupModalClickOutside() {
    document.getElementById('bookModal').addEventListener('click', (e) => {
        if (e.target.id === 'bookModal') {
            closeModal();
        }
    });
}