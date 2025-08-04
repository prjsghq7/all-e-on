package com.dev.alleon.vos;

public class PageVo {
    public final int rowCount;      // 한 페이지에 표시할 게시글의 개수
    public final int page;          // 사용자가 요청한 페이지 번호
    public final int totalCount;    // 전체 리뷰 개수
    public final int maxPage;       // 이동 가능한 최대 페이지 번호
    public final int dbOffset;      // SELECT 시 OFFSET 값

    public final int pageSize = 10; // 한 번에 보여줄 페이지 번호 수
    public int startPage;     // 페이지 표출 시, 첫 페이지 번호
    public int endPage;       // 페이지 표출 시, 마지막 페이지 번호

    public PageVo(int rowCount, int page, int totalCount) {
        this.rowCount = rowCount;
        this.totalCount = totalCount;
        this.maxPage = totalCount / rowCount + (totalCount % rowCount == 0 ? 0 : 1);
        this.page = Math.min(page, this.maxPage);
        this.dbOffset = Math.max(0, (this.page - 1) * rowCount);

        int halfBlock = pageSize / 2;

        this.startPage = page - halfBlock;
        this.endPage = page + halfBlock - 1;

        if (this.startPage < 1) {
            this.endPage += 1 - this.startPage;
            this.startPage = 1;
        }

        if (this.endPage > maxPage) {
            this.startPage -= this.endPage - maxPage;
            this.endPage = maxPage;
        }

        this.startPage = Math.max(1, this.startPage);
    }
}