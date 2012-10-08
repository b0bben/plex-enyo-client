# Plex EnyoJS Client
## CREDIT
_Main developer:_ b0bben
_Uses example code from_ Palm/HP
_Icons:_ Plex Inc.
_Uses Parser by JavaScript Kantan Library for Parsing XML,Copyright 2005-2007 Kawasaki Yusuke <u-suke@kawa.net>

## Description
This is the Plex client for the HP/Palm webOS, written in Enyo JS framework (version 1)
It talks to Plex Media Server on your local network, or thru MyPlex.
Following features from Plex Media Server are supported:
* __Listing and watching movies, tvshows
* __Listing and listening to music
* __Multiple PMS servers
* __MyPlex

Videos in format NOT SUPPORTED by the device are streamed using HLS (HttpLiveStreaming).
Videos in format SUPPORTED by the device (HP TouchPad for example) are played without streaming. This works wonderfully, even scrubbing ;) 

## Issues
Plex for webOS has a couple of issues, believe it or not, most important ones being:
* __Problems with scrubbing (rev/ff) videos streamed via HLS
* __No support for channels in Plex
* __UX not optimal for phones
Hopefully, someone will step up and contribute to fixing the above. :)

## License
Copyright (c) 2012, Mario Bob Jelica (b0bben)
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
Neither the name of the Plex and/or b0bben nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.