// جلب معاملات الرابط (URL Parameters)
const urlParams = new URLSearchParams(window.location.search);
const channelName = urlParams.get('name');
const channelStreamUrl = urlParams.get('url');

if (channelName && channelStreamUrl) {
    // عرض اسم القناة في العنوان
    document.getElementById('playingChannelTitle').innerText = decodeURIComponent(channelName);
    
    // تمرير الرابط للمشغل
    const videoPlayer = document.getElementById('standaloneVideoPlayer');
    videoPlayer.src = decodeURIComponent(channelStreamUrl);
} else {
    document.getElementById('playingChannelTitle').innerText = "قناة غير موجودة";
}
