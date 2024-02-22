 document.addEventListener('DOMContentLoaded', () => {
    UI.parts.include({
        src: 'header.html',
        dataId: 'header'
    });
    UI.parts.include({
        src: 'footer.html',
        dataId: 'footer',
        callback:() => {
            UI.exe.swiperFooter = new Swiper('.footer-banner-swiper', {
                // Optional parameters
                slidesPerView: 'auto',
                spaceBetween: 16,
                loop: true,
                autoplay: {
                    delay: 2500,
                },
                

                // Navigation arrows
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },

                // And if we need scrollbar
                scrollbar: {
                    el: '.swiper-scrollbar',
                },
            });
        }
    });
});