// ==UserScript==
// @name         크랙 웹기능 부분 롤백
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  프사 원본 비율 100% 존중(잘림/여백 없음), 뱃지 정상화, 상세페이지 블러 삭제, 좋아요 우측하단
// @match        *://crack.wrtn.ai/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const customCSS = `
        /* =========================================
           1. [목록 레이아웃] 병렬 깨짐 방지 및 세로 배치
           ========================================= */
        .flex.items-center > p.typo-text-sm_leading-paragraph_medium,
        .flex.items-center > div.w-3\\.5.h-3\\.5 {
            display: none !important;
        }
        .flex.flex-col.gap-1 > .flex.items-center {
            flex-direction: column !important;
            align-items: flex-start !important;
            margin-top: 2px !important;
        }

        /* =========================================
           2. [채팅창 목록] 좌측 패널 썸네일 (깔끔함을 위해 이곳만 1:1 유지)
           ========================================= */
        div[width="32"][height="48"],
        a[href*="/episodes/"] .aspect-\\[2\\/3\\] {
            width: 48px !important;
            height: 48px !important;
            aspect-ratio: 1 / 1 !important;
        }
        a[href*="/episodes/"] img:not(.blur-md) {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
        }
        a[href*="/episodes/"] img.blur-md { display: none !important; }

        /* =========================================
           3. 🚨 [스토리 상세 페이지] 원본 비율 자동 맞춤 & 블러 삭제
           ========================================= */
        /* 배경 이미지가 들어가는 최상단 껍데기 무력화 */
        .css-bdwsp8 .bg-cover.bg-center {
            background-image: none !important;
            background-color: transparent !important;
            width: auto !important;
            height: auto !important;
            min-height: unset !important;
            padding: 0 !important;
        }

        /* 붕 뜨게 만드는 원흉인 블러 레이어 찢어버리기 */
        .css-bdwsp8 .backdrop-blur-\\[10px\\] {
            display: none !important;
        }

        /* 프사 껍데기의 너비는 고정하되, 높이는 사진 비율에 맞게 알아서 늘어나도록 설정 */
        .css-1f8kyq {
            width: 270px !important;
            height: auto !important; /* 높이 자동 */
            max-width: 100% !important;
            position: relative !important;
        }
        /* 억지로 2:3 맞추던 속성 무력화 */
        .css-1f8kyq .aspect-\\[2\\/3\\] {
            aspect-ratio: auto !important;
            height: auto !important;
        }
        /* ❗️수정됨❗️ 원본 비율 그대로 출력 (잘림 없음, 여백 없음) */
        .css-1f8kyq .aspect-\\[2\\/3\\] img:not(.blur-md) {
            position: relative !important;
            object-fit: contain !important;
            width: 100% !important;
            height: auto !important; /* 원본 비율대로 출력 */
            display: block !important;
        }

        /* =========================================
           4. [정보창 팝업 모달] 프사 원본 비율 자동 맞춤
           ========================================= */
        .character-info-modal-content-body .w-\\[220px\\].h-\\[330px\\] {
            width: 220px !important;
            height: auto !important; /* 높이 자동 */
            position: relative !important;
        }
        .character-info-modal-content-body .w-\\[220px\\] .aspect-\\[2\\/3\\] {
            aspect-ratio: auto !important;
            height: auto !important;
        }
        /* 블러 이미지 완전 삭제 */
        .character-info-modal-content-body img.blur-md {
            display: none !important;
        }
        /* ❗️수정됨❗️ 원본 비율 그대로 출력 (잘림 없음, 여백 없음) */
        .character-info-modal-content-body .w-\\[220px\\] img:not(.blur-md) {
            position: relative !important;
            inset: auto !important;
            width: 100% !important;
            height: auto !important; /* 원본 비율대로 출력 */
            object-fit: contain !important;
            border-radius: inherit;
            display: block !important;
        }

        /* =========================================
           5. 커스텀 좋아요 하트 버튼 (프사 우측 하단)
           ========================================= */
        .custom-like-wrapper {
            position: absolute !important;
            bottom: 12px !important;
            right: 12px !important;
            z-index: 50 !important;
            background: rgba(255, 255, 255, 0.85) !important;
            border-radius: 50% !important;
            padding: 8px !important;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 44px !important;
            height: 44px !important;
        }
        html[data-theme="dark"] .custom-like-wrapper { background: rgba(30, 30, 30, 0.85) !important; }
        .custom-like-wrapper button {
            width: 100% !important;
            height: 100% !important;
            background: transparent !important;
            padding: 0 !important;
            border: none !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        .custom-like-wrapper button svg {
            width: 24px !important;
            height: 24px !important;
            fill: #FF4432 !important;
        }
    `;

    if (typeof GM_addStyle !== "undefined") {
        GM_addStyle(customCSS);
    } else {
        let styleNode = document.createElement("style");
        styleNode.appendChild(document.createTextNode(customCSS));
        (document.querySelector("head") || document.documentElement).appendChild(styleNode);
    }

    // 좋아요 버튼 위치 조작
    const observer = new MutationObserver(() => {
        const likeBtn = document.querySelector('button[aria-label="좋아요"]');

        if (likeBtn && !likeBtn.dataset.moved) {
            const detailProfile = document.querySelector('.css-1f8kyq');
            const modalProfile = document.querySelector('.character-info-modal-content-body .w-\\[220px\\]');

            const targetContainer = detailProfile || modalProfile;

            if (targetContainer) {
                const wrapper = document.createElement('div');
                wrapper.className = 'custom-like-wrapper';

                wrapper.appendChild(likeBtn);
                targetContainer.appendChild(wrapper);

                likeBtn.dataset.moved = 'true';
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
