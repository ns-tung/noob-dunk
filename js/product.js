const storedCart = localStorage.getItem('cart');
const token = localStorage.getItem('token');
const api = 'https://students.trungthanhweb.com/api/';
const imgSrc = 'https://students.trungthanhweb.com/images/';
const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
});

$(document).ready(function () {
    login();
    logout();
    checkInfo();
    showData();
});

function formatCurrency(e) {
    e = e.toString();
    e = e.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    return e;
}

function checkInfo() {
    if (token&&token!==null) {
        $('#login,#login-mb,#info').hide();
    } else {
        $('#logout,#logout-mb,#brands,#categories').hide();
        $('#cartCount,#cartCount-mb').text('0');
    }
}

function login() {
    $('#loginBtn,#loginBtn-mb').click(function (e) {
        e.preventDefault();
        const emailInput = $('#email');
        const submitBtn = $('#submitBtn');
        const loginModal = $('#loginModal');
        loginModal.modal('show');
        emailInput.keyup(function () {
            const email = emailInput.val().trim();
            submitBtn.toggleClass('disabled', email === '');
        })
        submitBtn.click(function (e) { 
            e.preventDefault();
            const email = emailInput.val().trim();
            $.ajax({
                type: 'POST',
                url: 'https://students.trungthanhweb.com/api/checkLoginhtml',
                data: {email},
                dataType: 'JSON',
                success: function (res) {
                    if(res.check){
                        Toast.fire({
                            icon: 'success',
                            title: 'Ngon lành, chờ xíu nha!'
                        }).then(()=>{
                            localStorage.setItem('token',res.apitoken);
                            window.location.reload();
                        });
                    } else {
                        Toast.fire({
                            icon: 'error',
                            title: 'Email không đúng!'
                        });
                    }
                }
            });
        });
    });
}

function logout() {
    $('#logoutBtn,#logoutBtn-mb').click(function (e) { 
        e.preventDefault();
        if (token&&token!==null) {
            localStorage.removeItem('token');
            localStorage.removeItem('cart');
        }
        Toast.fire({
            icon: 'success',
            title: 'OK, See ya!'
        }).then(()=>{window.location.replace('index.html');});
    });
}

function showData() {
    let url = api+'single';
    const params = new URLSearchParams(window.location.search);
    if (token||token!==null) {
        if (storedCart||storedCart!==null) {
            let cart = JSON.parse(storedCart);
            $('#cartCount,#cartCount-mb').text(cart.length);
        }
        if (!params.has('id')||params.get('id')==='') {
            window.location.replace('index.html');
        }
        let id = params.get('id');
        $.ajax({
            type: "GET",
            url: url,
            data: {apitoken:token,id},
            dataType: "JSON",
            success: function (res) {
                const brands = res.brands;
                const categories = res.categrories;
                const product = res.products[0];
                const galleries = res.gallery;
                if (Array.isArray(brands) && brands.length) {
                    str = '';
                    brands.forEach(e => {
                        str+=`<li><a class="dropdown-item" href="brand.html?id=${e.id}">${e.name}</a></li>`;
                    });
                    $('#brands').html(str);
                }
                if (Array.isArray(categories) && categories.length) {
                    str = '';
                    categories.forEach(e => {
                        str+=`<li><a class="dropdown-item" href="category.html?id=${e.id}">${e.name}</a></li>`;
                    });
                    $('#categories').html(str);
                }
                $('title').text(`${product.name} – NoobDunk`);

                let imageGallery = '';
                galleries.forEach(e => {
                    imageGallery=`
                        <div role="button" class="col border border-light-subtle bg-white rounded-3 overflow-hidden">
                            <img class="img-fluid slide-image" src="${e}" alt="${product.name}">
                        <div>`;
                        $('#carousel').append(imageGallery);
                });

                let image=imgSrc+product.images;
                $('#product-image').attr('src',image);
                const id = product.id;
                const name = product.name;
                const productPrice =  `${formatCurrency((product.price*(100-product.discount)/100))}<sup><u>đ</u></sup><s class="text-body-tertiary fw-normal ms-4 small">${formatCurrency(product.price)}<sup><u>đ</u></sup></s>`;
                const discount= product.discount +"%";
                const brand = product.brandname;
                const cate = product.catename;
                const detail = product.content;
                $('#product-name').html(name);
                $('#discount').text(discount);
                $('#product-price').html(productPrice);
                $('#cate-name').text(cate);
                $('#brand-name').text(brand);
                $('#addToCart').html(`<button type="button" class="btn btn-danger addToCart" data-id="${id}"><i class="bi bi-bag-plus me-2"></i>Thêm vào giỏ</button>`);
                $('#product-detail').html(detail);
                Owl();
                addToCart();
                imageChange();
                // searchProduct();
            }
        });
    }
}

function addToCart() {
    let cart = [];
    if (storedCart||storedCart!==null) {
        cart = JSON.parse(storedCart);
        $('#cartCount,#cartCount-mb').text(cart.length);
    }
    $('.addToCart').click(function (e) {
        e.preventDefault();
        let id = Number($(this).attr('data-id'));
        let quantity = 1;
        let product = [id,quantity];

        let check = false;
        cart.forEach(e => {
            console.log(e);
            if (e[0]===id) {
                e[1]++;
                check = true;
            }
            console.log(check);
        });
        if (!check) {
            cart.push(product);
            $('#cartCount').text(cart.length);
        }
        localStorage.setItem('cart',JSON.stringify(cart));
        Toast.fire({
            icon: 'success',
            title: 'Đã thêm vào giỏ!'
        });
    });
}

function imageChange() {
    $('.slide-image').click(function (e) { 
        e.preventDefault();
        const src = $(this).attr('src');
        $('#product-image').attr('src',src);
    });
}

function Owl(){
    $('#carouselGallery').owlCarousel({
        loop:true,
        margin:20,
        responsiveClass:true,
        items:1 ,
        responsive:{
            0:{items:3},
            1200:{items:4},
        }
        
    })
    $('#sameCateProducts').owlCarousel({
        loop:true,
        margin:20,
        responsiveClass:true,
        items:6,
        responsive:{
            0:{items:1},
            600:{items:3},
            1000:{items:5}
        }
        
    })
    $('#sameBrandProducts').owlCarousel({
        loop:true,
        margin:20,
        responsiveClass:true,
        items:6, 
        responsive:{
            0:{items:1},
            600:{items:3},
            1000:{items:5}
        }
        
    })
}