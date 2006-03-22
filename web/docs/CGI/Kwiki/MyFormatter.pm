package CGI::Kwiki::MyFormatter;
use strict;
use base 'CGI::Kwiki::Formatter';

#sub new {
  #my ( $c ) = @_;
  #bless{},$c;
#}

sub wiki_link_format {
   my ($self, $text) = @_;
   my $script = $self->script;
   my $url = $self->escape($text);
   #my $wiki_link = qq{<a href="$script?$url">$text</a>};   # removed by Gabor
   my $wiki_link = qq{<a href="$url">$text</a>};            # added by Gabor
   if (not $self->database->exists($text)) {
       $wiki_link =~ s/<a/<a class="empty"/;
   }
   elsif (not $self->is_readable($text)) {
       $url = $self->escape($self->loc("KwikiPrivatePage"));
       $wiki_link =
         qq{<a class="private" href="$script?$url">$text</a>};
   }
   return $wiki_link;
}
1;
