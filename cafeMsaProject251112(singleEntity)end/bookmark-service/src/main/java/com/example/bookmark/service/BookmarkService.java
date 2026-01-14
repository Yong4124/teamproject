package com.example.bookmark.service;

import com.example.bookmark.model.Bookmark;
import com.example.bookmark.repository.BookmarkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;

    public List<Bookmark> getBookmarks(Long userId) {
        return (userId != null)
                ? bookmarkRepository.findByUserId(userId)
                : bookmarkRepository.findAll();
    }

    public Bookmark addBookmark(Bookmark bookmark) {
        if (bookmark.getUserId() != null && bookmark.getProductId() != null) {
            boolean exists = bookmarkRepository.existsByUserIdAndProductId(
                    bookmark.getUserId(),
                    bookmark.getProductId()
            );
            if (exists) {

                throw new IllegalStateException("이미 즐겨찾기한 상품입니다.");
            }
        }
        return bookmarkRepository.save(bookmark);
    }

    public void deleteBookmark(Long id) {
        if (!bookmarkRepository.existsById(id)) {
            throw new IllegalArgumentException("not found");
        }
        bookmarkRepository.deleteById(id);
    }
}
