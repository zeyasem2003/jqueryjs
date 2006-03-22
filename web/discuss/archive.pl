#!/usr/bin/perl
#
# mailman-archive-to-rss -- scrape the archives of a MailMan list and
# convert to an RSS feed using XML::RSS.
#
# To use, either edit and update the @LISTS array, or run with -help
# to view the options used to specify list details on the command line.
# Requires XML::RSS.
#
# Released under the same license as Perl itself.
# 
# Nov 28 2001 jm - http://taint.org/mmrss/
#
# Updated 28 July 2002 - http://www.spack.org/index.cgi/MailmanHelp
#
# Ryan Wise <wise@spack.org> hacked support for threaded mode, post counts,
# printing of the subject rather then the author as the item title and 
# striping the list name in the subject from the RSS title.
# You can see examples at http://www.spack.org/rss/ or 
# in use at http://www.csof.net/
#
# Updated Nov 11 2002 jm - now escapes HTML stuff in description correctly,
# thanks to Bill Kearney for pointing this out
# 
# Updated Feb 17 2003 jm - Sean M. Burke pointed out that high-bit chars
# were not escaped, which is illegal XML.  fixed using HTML::Entities.
#
# Updated Nov  8 2005 jm - Bill McGonigle <bill@bfccomputing.com>
# sent over a patch to add support for removing the 'description'
# field from the start of the Subject line, a la "[foo] real subject".

# Notes 
# 
# * Read the strftime man page to find out what %Y, %B etc mean.
# * You no longer specify the full path of the archive URL.  Instead leave 
#   off the final file name (eg. date.html) and choose an archive_style of 
#   either date or thread.
# * In date mode you get one RSS item per message.
# * In thread mode you get one RSS item per thread (with a prefix of how 
#   many messages are in the thread).  Note, some mailers don't support mail
#   threads and break them, we do nothing to try and fix it.
#
# -- Adam Shand <adam@spack.org>

use strict;
use vars qw(@LISTS);

@LISTS = (
  {
    rss_version =>	'0.91',
    archive =>		'http://jquery.com/pipermail/discuss_jquery.com/%Y-%B/',
    archive_style =>    'date',
    description =>	'jQuery Discussion List',
    num_visible =>	25,
    scrape_text =>	1,
    rss_output =>	'/home/jquery/www/discuss/feed.xml'
  }
);

sub usage { warn "

usage: mailman-archive-to-rss [ [ -option \"value\" ] ... ]

options:  (default value specified)

";
  foreach my $opt (sort keys %{$LISTS[0]}) {
    printf STDERR "  -%-12s \"%s\"\n", $opt, $LISTS[0]->{$opt};
  }
  die "\n";
}

while ($_ = shift @ARGV) {
  /^-(\S+)/ or usage();
  if (!defined $LISTS[0]->{$1}) { usage(); }

  $LISTS[0]->{$1} = (shift @ARGV);
  @LISTS = ($LISTS[0]);		# remove any other lists
}

use XML::RSS;
use LWP::Simple;
use HTML::TokeParser;

my $DEBUG = 0;

foreach my $list (@LISTS) {
  my $rss = XML::RSS->new (version => $list->{rss_version});
  my $archiveurl = $list->{archive};
  my $archive_style = $list->{archive_style};

  if ($archive_style !~ /^(date|thread)$/){
      die "$0: -archive_style must be 'date' or 'thread'\n";
  }

  use POSIX qw(strftime);
  $archiveurl = strftime ($archiveurl, gmtime());

  if ($archiveurl =~ m#/$#){
      $archiveurl .= ($archive_style eq 'thread' ? 'thread.html' : 'date.html');
  }

  print "list: $archiveurl\n";
  my $content;
  my $file;
  if ($DEBUG) {
    $file = 'date.html';
  } else {
    $file = get_cachefile_for_url ($archiveurl);
    my $rcode = mirror ($archiveurl, $file);
    if (handle_http_errors ($archiveurl, $rcode)) { next; }
  }

  open (IN, "<$file") or die "cannot open $file";
  $content = join ('', <IN>); close IN;

  my $archiver = 'mailman';
  if ($content =~ /<!-- MHonArc v\S+ -->/) {
    $archiver = 'mhonarc';
  }

  my $urlbase = $archiveurl;
  $urlbase =~ s,/[^/]+$,/,gs;

  # man, I shoulda done this with regexps. Still, TokeParser
  # is a nice idea...
  my $stream = HTML::TokeParser->new( \$content ) or die $!;

  my $tag = $stream->get_tag ("title");
  my $title = $stream->get_trimmed_text('/title');
  my $url;

  my $infourl = $archiveurl;

  if ($archiver eq 'mailman') {
    while ($tag = $stream->get_tag('a')) {
      $url = $tag->[1]{href} || "--";
      if ($url =~ /listinfo/) {
	$infourl = $url; last;
      }
    }
  }

  # remove MailMan verbage:
  # The FoRK 2001-November Archive by Date => FoRK
  $title =~ s/^The //gs;
  $title =~ s/ \d\d\d\d-\S+ Archive by Date//gs;
  $title =~ s/ by date//gs;	# mhonarc fmt

  my @posts = ();
  my $nest = 0;
  my @catch_tags = ("li");

  if ($archive_style eq 'thread'){
      push @catch_tags, "ul", "/ul";
  }

  while ($tag = $stream->get_tag(@catch_tags)) {
      if ($archive_style eq 'thread'){
	  if ($tag->[0] =~ /ul$/){
	      $tag->[0] =~ /^\// ? $nest-- : $nest++;
	      next;
	  }
	  
	  if ($nest > 0){
	      $posts[-1]->{msg_count}++;
	      next;
	  }
      }

    $tag = $stream->get_tag('a');
    $url = $tag->[1]{href} || "--";

    # only follow Mailman-style numeric links
    next unless ($url =~ /^(\d+|msg\d+)\.html$/);
    $url =~ s/&/&amp;/g;
    $url = $urlbase.$url;

    my $headline = $stream->get_trimmed_text('/a');
    $headline =~ s/&/&amp;/g;
    $headline =~ s/</&lt;/g;
    $headline =~ s/>/&gt;/g;
      $headline =~ s/^\s*\[\w+\]\s*//;

    my $who;
    if ($archiver eq 'mhonarc') {
      $tag = $stream->get_tag('em');
      $who = $stream->get_trimmed_text('/li');
      $who =~ s/^From(?:<\/em>|) //gs;
      $who =~ s/ (?:\&lt;|<).*$//gs;

    } else {
      $tag = $stream->get_tag('i');
      $who = $stream->get_trimmed_text('/i');
    }

    $who =~ s/<.*?>//g;
    $who =~ s/\&lt;.*?\&gt;//ig;
    $who =~ s/\&/\&amp;/g;
    $who =~ s/</\&lt;/g;
    $who =~ s/>/\&gt;/g;

    push (@posts, {
      url => $url,
      headline => $headline,
      who => $who,
      msg_count => 1
      });
  }

  # now create the rss
  $rss->channel(
    title        => 'jQuery Discussion List',
    link         => 'http://jquery.com/discuss/',
    description  => $list->{description}
  );
  
  my @postnums;
  if ($archiver eq 'mhonarc') {
    @postnums = (0 .. $list->{num_visible} - 1);

  } else {
    my $start = $#posts - ($list->{num_visible} - 1);
    if ($start < 0) { $start = 0; }
    @postnums = (reverse $start .. $#posts);
  }

  for my $i (@postnums) {
    my $post = $posts[$i];

    my $desc = $post->{who}.": ".$post->{headline};
    if ($list->{scrape_text}) {
      $desc .= ": ".scrape_message ($post->{url});
    }
    
    my $count = $post->{msg_count};
    my $s = ($count == 1 ? '' : 's');

    my $item_title;
    if ($archive_style eq 'thread'){
	$item_title = "[$count post$s] " . $post->{headline};
    }
    else {
	$item_title = $post->{headline};

        # if the list is prefixing every message with the list name
        # we don't want it in each title since we already have a title
        # in the RSS feed.  We're assuming the description field is
        # equal to the list name here.
        if ($item_title =~ m/^\[$list->{description}\]/) {
            $item_title =~ s/^\[$list->{description}\] //;
            $item_title = $1;
        }
    }

    $post->{url} =~ /(\d{4}-[a-z]+\/\d{6})/i;
    my $u = "http://jquery.com/discuss/$1/";

    $rss->add_item(
    	title => $item_title,
	link => $u,
	description => $desc
    );
  }

  $rss->save($list->{rss_output});
  print "rss: $list->{rss_output}\n";
}

expire_cache();
exit 0;

sub scrape_message {
  my $url = shift;
  local ($_);

  print "msg: $url\n";

  my $content;
  my $file;
  if ($DEBUG) {
    $file = 'message.html';

  } else {
    $file = get_cachefile_for_url ($url);

    # only check mod time if the file doesn't already exist
    if (!-f $file) {
      my $rcode = mirror ($url, $file);
      if (handle_http_errors ($url, $rcode)) { next; }
    }
  }

  open (IN, "<$file") or die "cannot open $file";
  $content = join ('', <IN>); close IN;

  my $stream = HTML::TokeParser->new( \$content ) or die $!;

  my $tag = $stream->get_tag ("pre");
  my $text = $stream->get_text('/pre');

  $text = mail_body_to_abstract ($text);

  use HTML::Entities;

  # make it valid-ish HTML
  encode_entities($text);
  $text =~ s/\n\n+/\n<br \/>\n/gs;

  # now double-encode...
  $text =~ s/\&/\&amp;/gs;
  $text =~ s/\</\&lt;/gs;
  $text =~ s/\>/\&gt;/gs;

  return $text;
}

sub mail_body_to_abstract {
  my $text = shift;
  local ($_);

  # strip quoted text, replace with \002
  # This is tricky, to catch the "> quote blah chopped\nin mail\n" case
  my $newtext = '';
  my $lastwasquote = 0;
  my $lastwasblank = 0;

  foreach (split (/^/,$text)) {
    s/^<\/I>//gi;

    if (/^\s*$/) {
      $lastwasblank = 1; $newtext .= "\n"; next;
    } else {
      $lastwasblank = 0;
    }

    if (/^\s*\S*\s*(?:>|\&gt;)/i) {
      $lastwasquote = 1; $newtext .= "\002"; next;
    } else {
      if ($lastwasquote && !$lastwasblank && length($_) < 20) { next; }
      $newtext .= $_;
      $lastwasquote = 0;
    }
  }
  $text = $newtext;

  # collapse \002's into 1 [...]
  $text =~ s/\s*\002[\002\s]*/\n\n[...]\n\n/igs;

  # PGP header
  $text =~ s/-----BEGIN PGP SIGNED MESSAGE-----.*?\n\n//gs;

  # MIME crud
  $text =~ s/\n--.+?\n\n//gs;
  $text =~ s/This message is in MIME format.*?\n--.+?\n\n//gs;
  $text =~ s/This is a multipart message in MIME format.*?\n--.+?\n\n//gs;
  $text =~ s/^Content-\S+:.*$//gm;

  # quoting lines:
  $text =~ s/^\n*[^\n]+ (?:quote|quotation|wrote|said|mentioned|scribbled):\n//gs;

  # trim sigs etc.
  $text =~ s/\n-- \n.*$//gs;	# trad-style
  $text =~ s/\n_____+.*$//gs;	# Hotmail
  $text =~ s/\n-----.*$//gs;	# catches PGP sigs

  # now trim down to about 300 chars
  $text =~ s/^(.{250,300}[\.\!\?\;\[\]]).*$/$1 \[...\]/gs
  	or $text =~ s/^(.{250,300})\n.*$/$1 \[...\]/gs;

  $text;
}

sub handle_http_errors {
  my $url = shift;
  my $rcode = shift;

  if (LWP::Simple::is_error ($rcode)) {
    warn "HTTP get $url failed: HTTP error code $rcode\n";
    return 1;
  }
  return 0;
}

sub get_cachefile_for_url {
  my $url = shift;

  my $dir = $ENV{'HOME'}."/.mailman2rss";
  if (!-d $dir) { mkdir ($dir, 0755); }

  my $tmpfile = $url;
  $tmpfile =~ s/[^-_=\.\,\+A-Za-z0-9]+/_/gs;
  return $dir."/".$tmpfile;
}

sub expire_cache {
  use File::Find;

  my $dir = $ENV{'HOME'}."/.mailman2rss";
  if (!-d $dir) { return; }

  File::Find::find (\&expire_wanted, $dir);
}

sub expire_wanted {
  if (-M $_ > 14.0) { unlink $_; }
}

