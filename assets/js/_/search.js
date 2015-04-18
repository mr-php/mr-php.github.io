// site search
//(function(w,d,t,u,n,s,e){w['SwiftypeObject']=n;w[n]=w[n]||function(){
//(w[n].q=w[n].q||[]).push(arguments);};s=d.createElement(t);
//e=d.getElementsByTagName(t)[0];s.async=1;s.src=u;e.parentNode.insertBefore(s,e);
//})(window,document,'script','//s.swiftypecdn.com/install/v1/st.js','_st');
//_st('install','UfjNQb2D33csw9E3BFjv');

// 404 search
if (page.path == '404.html') {
    $(function () {
        $.getJSON('//api.swiftype.com/api/v1/public/engines/search.json?callback=?', {
            engine_key: 'pzPCqKnYUkavsQVNZryZ', 
            q: window.location.pathname.split(/[-/_]/).join(' ').trim(), 
            per_page: 10
        }).success(function (data) {
            var $resultContainer = $('#st-results-container');
            $resultContainer.html('');
            if (data['records']['page'].length > 0) {
                $resultContainer.append('<h2>Suggested pages based on this URL</h2>');
            }
            $.each(data['records']['page'], function(index, result) {
                var resultHTML = '<hr><div class="post-preview"><a href="' + result['url'] + '"><h3>' + 
                (result['highlight']['title'] || result['title']) + '</h3><p>' +
                (result['highlight']['body'] || result['body'].substring(0, 300)) +
                '</p></a></div>';
                $resultContainer.append(resultHTML);
            });
        });
    });
}
