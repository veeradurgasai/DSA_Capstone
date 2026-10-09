package com.lostfound.repository;

import com.lostfound.entity.ItemKeyword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemKeywordRepository extends JpaRepository<ItemKeyword, Long> {
    List<ItemKeyword> findByItemTypeAndItemId(String itemType, Long itemId);
    List<ItemKeyword> findByKeyword(String keyword);
}
