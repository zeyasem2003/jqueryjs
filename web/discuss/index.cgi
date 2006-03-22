#!/usr/bin/perl

use CGI;
use LWP::Simple;
use LWP::UserAgent;

my $ua = new LWP::UserAgent();
my $cgi = new CGI();
my $title = "jQuery Mailing List";
my $body = '';
my $d = $cgi->param('d');
my $m = $cgi->param('m');

if ( $cgi->param('m') ) {
  my $p = get("http://jquery.com/pipermail/discuss_jquery.com/$d/$m\.html");
  $p =~ /<h1>\[jQuery\] (.*?)<\/h1>.*?<b>(.*?)<\/b>.*?(<a.*?<\/a>).*?<i>(.*?)<\/i>/is;
  $title = $1;
  my $name = $2;
  my $email = $3;
  my $date = $4;

  $p =~ /<pre>(.*?)<\/pre>/is;
  my $t = $1;
  $t =~ s/\n/<br\/>/g;

  $body = qq~
  <br/><b>Posted:</b> $date<br/>
  <b>From:</b> $name &lt;$email&gt;<br/><br/>
  $t
  ~;
} elsif ( $cgi->param('d') ) {
  my $n = join(' ',reverse split('-',$d));
  $title = "$n Archives";
  my $p = get("http://jquery.com/pipermail/discuss_jquery.com/$d/thread.html");
  $p =~ s/\n/ /g;
  $p =~ s/ +/ /g;
  $body = $p;
  $p =~ /<p> (<ul>.*?<\/ul>) <p>/i;
  $body = $1;
  $body =~ s/(\d+)\.html">\[jQuery\] /$1\/">/g;
} elsif ( $cgi->param('sub') ) {
  $title = 'Subscribed';
  $body = qq~
  <p>Thank you for subscribing to the mailing list, you will need to
  confirm your email address before you can begin receiving messages,
  however. Please check your email to continue.</p>
  ~;

  $ua->post("http://jquery.com/mailman/subscribe/discuss_jquery.com",{
    email => $cgi->param('email'),
    digest => 0,
    'email-button' => 'Subscribe'
  });
} else {
  my $r = '';
  my $p = get("http://jquery.com/pipermail/discuss_jquery.com/");
  while ( $p =~ /([a-z0-9-]+)\.txt/igs ) {
    my $n = join(' ',reverse split('-',$1));
    $r .= "<li><a href='$1/'>$n</a></li>";
  }

  $body = qq~
  <p>jQuery has an active mailing list where you can feel free
  to discuss jQuery, ask questions, talk about Javascript,
  or announce your plugins.</p>

  <p><strong>Discuss:</strong> <a href="mailto:discuss\@jquery.com">discuss\@jquery.com</a></p>

<form action='' method='POST'>
  <input type='hidden' name='sub' value='1'/>
  <p><b>Subscribe:</b>
  <input type="text" name='email' value="me\@email.com"/> <input type="submit" value="Join"/><br/> 
  <b>OR</b> Subscribe to the <a href="/discuss/feed/">Mailing List RSS Feed</a>.</p>
</form>

  <h3>Archives</h3>
  <ul>$r</ul>~;
}

print "Content-type: text/html\n\n";
print qq~
<html>
<head>
	<title>jQuery: Discuss: $title</title>
	<link rel="stylesheet" type="text/css" href="/css/style.css" />
  <script type="text/javascript" src="/src/latest/"></script>
	<script type="text/javascript" src="/js/global.js"></script>
	<link rel="alternate" type="application/rss+xml" title="jQuery Mailing List" href="http://jquery.com/discuss/feed/" />
</head>
<body>
<div class="head"></div>
	<div class="wrap"><div class="wrap2"><br/>
		<h1><a href="/"><img src="/images/hat2.gif"/> jQuery</a><br/><span>New Wave Javascript</span></h1><br/>

	<h2><a href="/discuss/">discuss</a> &raquo; $title</h2>

	$body
		
	</div></div>
</body>
</html>
~;
