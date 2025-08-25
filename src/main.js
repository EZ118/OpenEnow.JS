function slideAutoScale() {
    // 父容器的宽高
    let parentWidth, parentHeight;
    if (document.fullscreenElement) {
        parentWidth = $(window).width();
        parentHeight = $(window).height();
    } else {
        parentWidth = $(window).width();
        parentHeight = $(window).height() - 50;
    }

    // 固定内容尺寸
    const contentWidth = 1280;
    const contentHeight = 720;

    // 计算缩放比例
    let scale = Math.min(parentWidth / contentWidth, parentHeight / contentHeight);

    // 居中定位
    let left = (parentWidth - contentWidth * scale) / 2;
    let top = (parentHeight - contentHeight * scale) / 2;

    $('#enow-show').css({
        width: contentWidth + 'px',
        height: contentHeight + 'px',
        position: 'relative',
        left: left + 'px',
        top: top + 'px',
        transform: `scale(${scale})`,
        transformOrigin: '0 0'
        // transition 不需要在这里设置，已在 CSS 里
    });
}

$(document).ready(function () {
    var page = 0;
    const en = new ENOW();
    en.CONFIG({ container: '#enow-show', zip: {} });

    $('#viewRepo').click(function () {
        window.open('https://github.com/EZ118/OpenEnow.JS/', '_blank');
    });
    $('#pickFile').click(function () {
        $('#fileInput').click();
    });
    $('#fullScreen').click(function () {
        $("main")[0].requestFullscreen();
    });

    $("#prevPage").click(function () {
        if (page > 0) {
            page -= 1;
            $("#pageNum").text(page + 1);
            en.display(page);
        }
        else { return; }
    });
    $("#nextPage").click(function () {
        page += 1;
        $("#pageNum").text(page + 1);
        en.display(page);
    });

    $('#fileInput').on('change', async function (event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            JSZip.loadAsync(event.target.result).then(async function (zip) {
                en.CONFIG({
                    container: '#enow-show',
                    zip: zip
                });

                page = 0;
                $("#pageNum").text(page + 1);
                await en.display(0);
            });
        };
        reader.readAsArrayBuffer(file);
    });

    $(window).on('resize', function () {
        slideAutoScale();
    });

    slideAutoScale();





    // 快捷键
    $(document).on('keydown', (e) => {
        switch (e.key) {
            case ' ':
                e.preventDefault();
                $("#nextPage").click();
                break;
            case 'ArrowLeft':
                e.preventDefault()
                $("#prevPage").click();
                break;
            case 'ArrowUp':
                e.preventDefault()
                $("#prevPage").click();
                break;
            case 'ArrowRight':
                e.preventDefault();
                $("#nextPage").click();
                break;
            case 'ArrowDown':
                e.preventDefault();
                $("#nextPage").click();
                break;
            default:
                break;
        }
    });
});