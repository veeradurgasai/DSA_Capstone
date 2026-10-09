package com.lostfound.dsa;

/**
 * Generic node for prioritized elements in MaxHeap.
 *
 * @param <T> Payload type
 */
public class HeapNode<T> implements Comparable<HeapNode<T>> {
    private final int priority;
    private final T data;

    public HeapNode(int priority, T data) {
        this.priority = priority;
        this.data = data;
    }

    public int getPriority() {
        return priority;
    }

    public T getData() {
        return data;
    }

    @Override
    public int compareTo(HeapNode<T> other) {
        return Integer.compare(this.priority, other.priority);
    }

    @Override
    public String toString() {
        return "HeapNode{" + "priority=" + priority + ", data=" + data + '}';
    }
}
