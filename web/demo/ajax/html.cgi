#!/usr/bin/perl

use CGI qw/:standard/;

print "Content-type: text/html\n\n";
print "<h2> Hello, " . param('name') . "</h2>";
