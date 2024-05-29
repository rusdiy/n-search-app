$(function() {
    $("#searchQuery").autocomplete({
        source: 
            function(request, response) {
            const query = window.API_ENDPOINT + `/endpoint/suggest.php?q=${request.term}&field=_default&field=title&num=5`;
            $.ajax({
                url: query,
                dataType: "json",
                success: function(data) {
                    if (data && data.data) { // Check if data.data exists
                        response(data.data.map(item => item.text));
                    } else {
                        response([]);
                    }
                },
                error: function(xhr, status, error) {
                    console.error(xhr, status, error);
                    response([]);
                }
            });
        },
        minLength: 1 // Minimum characters to trigger autocomplete
    });
});

$(document).ready(showPopularWords);
