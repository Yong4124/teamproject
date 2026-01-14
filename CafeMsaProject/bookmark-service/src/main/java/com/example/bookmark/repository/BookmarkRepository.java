package com.example.bookmark.repository;

import com.example.bookmark.model.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    // 유저별 조회
    List<Bookmark> findByUserId(Long userId);

    // 같은 사람 + 같은 상품 중복 방지
    boolean existsByUserIdAndProductId(Long userId, Long productId);

    boolean existsByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
