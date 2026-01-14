package com.example.bookmark.controller;

import com.example.bookmark.model.Bookmark;

import com.example.bookmark.service.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @GetMapping
    public List<Bookmark> getBookmarks(@RequestHeader("X-User-Id") Long userId) {
        return bookmarkService.getBookmarks(userId);
    }

    @PostMapping
    public ResponseEntity<?> addBookmark(@RequestHeader("X-User-Id") Long userId,
                                         @RequestBody Bookmark bookmark)
    {
        try {
            bookmark.setUserId(userId);
            Bookmark saved = bookmarkService.addBookmark(bookmark);
            return ResponseEntity.ok(saved);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBookmark(@RequestHeader("X-User-Id") Long userId,
                                               @PathVariable Long id) {
        try {
            bookmarkService.deleteBookmark(id, userId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

