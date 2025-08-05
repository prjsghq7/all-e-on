package com.dev.alleon.results;

public interface Result {
    String name();

    String toString();

    default String toStringLower() {
        return this.toString().toLowerCase();
    }
}
