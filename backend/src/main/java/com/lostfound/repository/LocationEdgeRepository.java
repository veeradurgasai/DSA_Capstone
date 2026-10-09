package com.lostfound.repository;

import com.lostfound.entity.LocationEdge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationEdgeRepository extends JpaRepository<LocationEdge, Long> {
    List<LocationEdge> findBySourceLocationId(Long sourceLocationId);
}
