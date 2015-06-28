var disqus_shortname, disqus_identifier;

$(function() {
	$('input#search-input').on('propertychange keyup input paste change', function() {
		var hochschulPath = $(this).attr('data-hochschulpath');

		if ($(this).val() == '') {
			// input empty
			$('#search-results').hide();
			$(this).data('oldvalue', $(this).val());
			return;
		}
		if ($(this).data('oldvalue') == $(this).val()) return;
		$(this).data('oldvalue', $(this).val());

		var f = new Fuse(searchdb.hochschulen, {
			keys: ['name'],
			threshold: 0.4
		});

		var result = f.search( $(this).val() );

		$('#search-results').empty().fadeIn();
		$(result).each(function(i, hochschule) {
			if (i > 10) return;
			$('#search-results').append(
				'<li>'+
				'<a href="'+hochschulPath+hochschule.slug+'.html">'+
				hochschule.name+
				'</a>'+
				'</li>'
			);
		});

		if (result.length == 0) {
			$('#search-results').append(
				'<li>'+
				'<em>'+
				'nichts gefunden'+
				'</em>'+
				'</li>'
			);
		}

	});

	// Suchergebnisse schließen, wenn außerhalb geklickt wird
	$(document).click(function(event) {
		if ((!$(event.target).closest('#search-input').length) && (!$(event.target).closest('#search-results').length)) {
			if($('#search-results').is(":visible")) {
				$('#search-results').hide();
			}
		}
	});
	$('#search-results').hide();



	var foerdererFuse = new Fuse(searchdb.foerderer, {
		keys: ['name'],
		threshold: 0.4
	});
	$('input#foerderer-search-input').on('propertychange keyup input paste change', function() {
		var foerdererPath = $(this).attr('data-foerdererPath');

		if ($(this).val() == '') {
			// input empty
			$(this).data('oldvalue', $(this).val());
			$('#foerderer-search-results').hide();
			return;
		}
		if ($(this).data('oldvalue') == $(this).val()) return;
		$(this).data('oldvalue', $(this).val());

		var result = foerdererFuse.search( $(this).val() );

		$('#foerderer-search-results').empty().fadeIn();
		$(result).each(function(i, foerderer) {
			if (i > 10) return;
			$('#foerderer-search-results').append(
				'<li>'+
				'<a href="'+foerdererPath+foerderer.slug+'.html">'+
				foerderer.name+
				'</a>'+
				'</li>'
			);
		});

		if (result.length == 0) {
			$('#foerderer-search-results').append(
				'<li>'+
				'<em>'+
				'nichts gefunden'+
				'</em>'+
				'</li>'
			);
		}

	});



	// Disable all nonsense links <a href="#">
	$('body').on('click','a[href="#"]',function(e) {
		e.preventDefault();
	});



	// Hochschulen in Länder-Auswahl auf der Startseite filtern
	$('a.land-selector').click(function() {
		var land = $(this).attr('data-land');


		$('#hochschulen-land-selektion-wrapper').slideDown();
		var selektionHtml = '<option selected="selected" disabled="disabled">Hochschule auswählen</option>';
		$.each(searchdb.hochschulen, function(i, hochschule) {
			if(hochschule.bundesland == land) {
				selektionHtml += '<option value="'+ hochschule.slug +'">'+ hochschule.name +'</option>';
			}
		});
		$('#hochschulen-land-selektion').html(selektionHtml);


		$('a.land-selector').addClass('btn-default').removeClass('btn-primary');
		$(this).addClass('btn-primary').removeClass('btn-default');

		$('html, body').animate({
			scrollTop: $('#hochschulen-land-selektion-wrapper').offset().top - ($( window ).height() / 2)
		}, 'slow');

		$('#hochschulen-land-selektion').addClass('highlight');
		setTimeout(function() {
			$('#hochschulen-land-selektion').removeClass('highlight');
		}, 500);
	});

	$('#hochschulen-land-selektion').change( function() {
		window.location.href = 'hochschule/' + $(this).val() + '.html';
	});


	$('.sortable').tablesorter({
		textExtraction: function(cell) {
			return $(cell).attr('data-number') || $(cell).html();
		} 
	});



	$('.piechart').each( function() {
		// https://github.com/lugolabs/circles
		var myCircle = Circles.create({
			id:           $(this).attr('id'),
			radius:       60,
			value:        $(this).attr('data-wirtschaftpercent'),
			text:         function(value){return value + '%';},
			colors:       ['#AAD8E7', '#008CBA'],
			duration:       400,
			wrpClass:     'circles-wrp',
			textClass:      'circles-text',
			styleWrapper: true,
			styleText:    true
		});
	});



	$('.disqus-enable-button').click(function(){
		$(this).remove();

		disqus_shortname = 'hochschulwatch';
		disqus_identifier = $('#disqus_thread').attr('data-identifier');

		(function() {
			var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
			dsq.src = 'https://hochschulwatch.disqus.com/embed.js';
			document.getElementsByTagName('head')[0].appendChild(dsq);
		})();
	});

});
