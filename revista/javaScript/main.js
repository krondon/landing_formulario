document.addEventListener('DOMContentLoaded', function(){
    const pages = document.querySelectorAll('.book-page.page-right');
    const totalPages = pages.length;
    let zIndexBase = 100; // Base for right stack

    // Initialize z-indexes for right stack (Sheet 1 on top)
    pages.forEach((page, i) => {
        // i=0 (Sheet 14 in DOM? No, querySelectorAll returns in document order)
        // In HTML I put Sheet 14 first, then 13... then 1.
        // So pages[0] is Sheet 14. pages[13] is Sheet 1.
        // Sheet 1 (pages[13]) needs highest z-index.
        // Sheet 14 (pages[0]) needs lowest.
        page.style.zIndex = zIndexBase + i;
    });

    const book = document.querySelector('.book');

    const buttons = document.querySelectorAll('.nextprev-btn');
    buttons.forEach(btn=>{
        btn.addEventListener('click', (e)=>{
            e.stopPropagation(); // Prevent bubbling if we add click on page later
            const targetId = btn.dataset.page;
            const page = document.getElementById(targetId);
            if(!page) return;

            // Extract sheet number from id "turn-X"
            const sheetNum = parseInt(targetId.split('-')[1]);
            
            if (btn.classList.contains('back')) {
                // Flipping back to Right (Prev)
                page.style.zIndex = 2000 + totalPages; // Ensure it's above EVERYTHING during flip
                page.classList.remove('turn');
                
                // If closing cover (turn-1), remove open class from book
                if(targetId === 'turn-1') {
                    book.classList.remove('open');
                }
                // If closing last page (turn-14), remove close-right class (back to open)
                if(sheetNum === totalPages) {
                    book.classList.remove('close-right');
                    book.classList.add('open');
                }

                setTimeout(() => {
                    // Restore original z-index for right stack
                    page.style.zIndex = zIndexBase + (totalPages - sheetNum);
                }, 600); 
            } else {
                // Flipping to Left (Next)
                page.style.zIndex = 2000 + totalPages; // Ensure it's above EVERYTHING during flip
                page.classList.add('turn');
                
                // If opening cover (turn-1), add open class to book
                if(targetId === 'turn-1') {
                    book.classList.add('open');
                }
                // If opening last page (turn-14), add close-right class
                if(sheetNum === totalPages) {
                    book.classList.remove('open');
                    book.classList.add('close-right');
                }

                setTimeout(() => {
                    // Set z-index for left stack
                    page.style.zIndex = 200 + sheetNum;
                }, 600);
            }
        });
    });

    // Click on cover to open
    const cover = document.getElementById('turn-1');
    if(cover) {
        cover.addEventListener('click', (e) => {
            // Only if not already turned
            if(!cover.classList.contains('turn')) {
                // Find the next button inside and click it
                const btn = cover.querySelector('.nextprev-btn:not(.back)');
                if(btn) btn.click();
            }
        });
    }

    // Lightbox logic
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); display: none; align-items: center; justify-content: center;
        z-index: 2000; cursor: zoom-out;
    `;
    const lightboxImg = document.createElement('img');
    lightboxImg.style.cssText = `max-width: 95%; max-height: 95%; object-fit: contain; border-radius: 4px;`;
    lightbox.appendChild(lightboxImg);
    document.body.appendChild(lightbox);

    const images = document.querySelectorAll('.book-page img');
    images.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent page flip if clicking image
            lightboxImg.src = img.src;
            lightbox.style.display = 'flex';
        });
    });

    lightbox.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });
});
