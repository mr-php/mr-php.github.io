$(function() {

    $('#contactForm').find('input,textarea').jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {
            // additional error messages or events
        },
        submitSuccess: function($form, event) {
            event.preventDefault(); // prevent default submit behaviour
            // get values from FORM
            var name = $('input#name').val();
            var email = $('input#email').val();
            var phone = $('input#phone').val();
            var message = $('textarea#message').val();
            var firstName = name; // For Success/Failure Message
            // Check for white space in name for Success/Fail message
            if (firstName.indexOf(' ') >= 0) {
                firstName = name.split(' ').slice(0, -1).join(' ');
            }
            $.ajax({
                //url: '//getsimpleform.com/messages/ajax?form_api_token=3c63094a4813397862f3ad282bf8232b',
                url: '//formspree.io/hello@mrphp.com.au',
                method: 'POST',
                dataType: 'json',
                data: {
                    _subject: 'mrphp.com.au contact - ' + name,
                    name: name,
                    phone: phone,
                    email: email,
                    message: message
                },
                cache: false,
                success: function() {
                    // Success message
                    $('#success').html('<div class="alert alert-success">');
                    $('#success > .alert-success').html('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>');
                    $('#success > .alert-success').append('<strong>Your message has been sent. </strong>');
                    $('#success').append('</div>');

                    //clear all fields
                    $('#contactForm').trigger('reset');
                },
                error: function() {
                    // Fail message
                    $('#success').html('<div class="alert alert-danger">');
                    $('#success > .alert-danger').html('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>');
                    $('#success > .alert-danger').append('<strong>Sorry ' + firstName + ', it seems that my mail server is not responding. Please try again later!');
                    $('#success').append('</div>');
                }
            })
        },
        filter: function() {
            return $(this).is(':visible');
        }
    });

//    $('a[data-toggle="tab"]').click(function(e) {
//        e.preventDefault();
//        $(this).tab('show');
//    });
    
});

// reset errors
$('#contactForm').find('input,textarea').focus(function() {
    $('#success').html('');
});
