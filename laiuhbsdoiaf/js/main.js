const fixedOrder = document.querySelector('.fixed-order');
//const fixedAside = document.querySelector('.aside');
const swapShow = document.getElementById('swap-show');
const swapHide = document.getElementById('swap-hide');

function onScroll() {
    const swapShowRect = swapShow.getBoundingClientRect();
    const swapHideRect = swapHide.getBoundingClientRect();
    const shouldFix = swapShowRect.top < 0 && swapHideRect.top > window.innerHeight;
    fixedOrder.classList.toggle('fixed-order--fixed', shouldFix);
    //fixedAside.classList.toggle('aside--fixed', shouldFix);
}

window.addEventListener('scroll', onScroll);
window.addEventListener('resize', onScroll);

document.addEventListener('DOMContentLoaded', function () {

    document.querySelectorAll('.set-date[data-days]').forEach(el => {
        const offset = parseInt(el.getAttribute('data-days'), 10);
        const date = new Date();
        date.setDate(date.getDate() - offset);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        el.textContent = date.toLocaleDateString('en-US', options);
    });

    onScroll();

    function generateRaitingHTML(raiting) {
        let html = '<div class="review__raiting raiting">';
        for (let i = 1; i <= 5; i++) {
            const greyClass = i > raiting ? ' class="grey"' : '';
            html += `<svg${greyClass}><use xlink:href="#icon-raiting"></use></svg>`;
        }
        html += '</div>';
        return html;
    }

    // Обработка отправки формы
    const form = document.querySelector('.comments__form');
    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Остановить отправку

        let errors = '';
        const name = form.querySelector('[name="name"]').value;
        const review = form.querySelector('[name="review"]').value;
        const raiting = form.querySelector('[name="raiting"]').value;

        if (!name) errors += 'Field "Full name" is required.\n';
        if (!review) errors += 'Field "Review" is required.\n';

        const file = form.querySelector('[name="image"]').files[0];
        const image = file ? `<picture class="review__product"><img src="${URL.createObjectURL(file)}" alt="product" width="220" height="270"></picture>` : '';
        
        const fileAvatar = form.querySelector('[name="avatar"]').files[0];
        const avatar = fileAvatar ? `<picture class="review__photo img-cover"><img src="${URL.createObjectURL(fileAvatar)}" alt="name" width="80" height="80"></picture>` : '';

        if (errors > '') {
            alert(errors);
        } else {
            let newItem = `<div class="comments__review review">
                <div class="review__info">
                    ${avatar}
                    <div class="review__body">
                        <div class="review__name">${name}</div>
                        ${generateRaitingHTML(raiting)}
                    </div>
                    <div class="review__date">now</div>
                </div>
                <div class="review__text">${review.replaceAll("\n","<br>")}</div>
                ${image}
            </div>`;
            let container = document.querySelector('.comments__reviews');
            container.insertAdjacentHTML('afterbegin', newItem);
            form.remove();
        }
    });

    document.querySelectorAll('.upload__file').forEach(input => {
        input.addEventListener('change', () => {
            const file = input.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const parent = input.closest('.inp');
                    if (parent) {
                        parent.style.setProperty('--bg', `url("${e.target.result}")`);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    });

    const ratingContainer = document.querySelector('.form__votes');
    const stars = ratingContainer.querySelectorAll('svg');
    const input = document.querySelector('input[name="raiting"]');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            const ratingValue = index + 1;
            input.value = ratingValue;

            stars.forEach((s, i) => {
                if (i < ratingValue) {
                    s.classList.remove('grey');
                } else {
                    s.classList.add('grey');
                }
            });
        });
    });
    console.log('Loading success.');
});
