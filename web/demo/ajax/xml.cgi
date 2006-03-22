#!/usr/bin/perl

use CGI qw/:standard/;

print "Content-type: text/xml\n\n";
print "<bar><title> Hello, " . param('name') . "</title></bar>";
