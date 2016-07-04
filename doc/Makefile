
# ==================================================================
PAPER    = Abschlussarbeit
BIBFILE  = Bibliography.bib
IMGDPI   = 300
# ==================================================================

# XFIG_TEX_EXT = pstex_t
XFIG_TEX_EXT = texfig
CURRENTPAGE = 1
XDVI = xdvi -sidemargin 18mm -topmargin 30mm -yoffset 30mm -mfmode ljfour:600 -geometry 709x998+0+0 -s 6 +statusline

FIGDIR      = Figures
FIGDIR_PNG  = Figures-png
FIGDIR_JPEG = Figures-jpeg
FIGDIR_XFIG = Figures-xfig
FIGDIR_EPS  = Figures-eps-pdf

XFIGS = $(wildcard $(FIGDIR_XFIG)/*.fig)
PNGS  = $(wildcard $(FIGDIR_PNG)/*.png)
JPEGS = $(wildcard $(FIGDIR_JPEG)/*.jpg)
EPSS  = $(wildcard $(FIGDIR_EPS)/*.eps)
PDFS  = $(wildcard $(FIGDIR_EPS)/*.pdf)

DVI_XFIG = $(patsubst $(FIGDIR_XFIG)/%.fig,$(FIGDIR)/%.eps,$(XFIGS))
DVI_PNG  = $(patsubst $(FIGDIR_PNG)/%.png,$(FIGDIR)/%.eps,$(PNGS))
DVI_JPEG = $(patsubst $(FIGDIR_JPEG)/%.jpg,$(FIGDIR)/%.eps,$(JPEGS))
DVI_EPS  = $(patsubst $(FIGDIR_EPS)/%.eps,$(FIGDIR)/%.eps,$(EPSS))
DVI_PDF  = $(patsubst $(FIGDIR_EPS)/%.pdf,$(FIGDIR)/%.eps,$(PDFS))
FIG_DVI  = $(DVI_XFIG) $(DVI_PNG) $(DVI_JPEG) $(DVI_EPS) $(DVI_PDF)

PDF_XFIG = $(patsubst $(FIGDIR_XFIG)/%.fig,$(FIGDIR)/%.pdf,$(XFIGS))
PDF_PNG  = $(patsubst $(FIGDIR_PNG)/%.png,$(FIGDIR)/%.png,$(PNGS))
PDF_JPEG = $(patsubst $(FIGDIR_JPEG)/%.jpg,$(FIGDIR)/%.png,$(JPEGS))
PDF_EPS  = $(patsubst $(FIGDIR_EPS)/%.eps,$(FIGDIR)/%.pdf,$(EPSS))
PDF_PDF  = $(patsubst $(FIGDIR_EPS)/%.pdf,$(FIGDIR)/%.pdf,$(PDFS))
FIG_PDF  = $(PDF_XFIG) $(PDF_PNG) $(PDF_JPEG) $(PDF_EPS) $(PDF_PDF)

all:	thedvi ps2pdf

ps:     $(PAPER).ps
png:    $(patsubst $(FIGDIR_PPM)/%.ppm,$(FIGDIR_PNG)/%.png,$(PPMS))
figdvi: $(FIG_DVI)
figpdf: $(FIG_PDF)

dvionce: $(FIG_DVI)
	latex $(PAPER).tex
pdfonce: $(FIG_PDF)
	pdflatex $(PAPER).tex
xdvi:
	$(XDVI) +$(CURRENTPAGE) $(PAPER).dvi &
gml:
	Meshlib/test-gml Models/Test.genmod &
xpdf:
	gv $(PAPER).pdf &

thepdf: $(FIG_PDF)
	pdflatex $(PAPER).tex
	- bibtex $(PAPER)
	- makeindex -s Scripts/myindex.ist $(PAPER)
	pdflatex $(PAPER).tex
	pdflatex $(PAPER).tex
thedvi: $(FIG_DVI)
	- cp Archiv/*.eps Figures
	latex $(PAPER).tex
	- bibtex $(PAPER)
	- makeindex -s Scripts/myindex.ist $(PAPER)
	latex $(PAPER).tex
	latex $(PAPER).tex

ps2pdf: $(PAPER).ps
	ps2pdf -dMaxSubsetPct=100 -dSubsetFonts=true -dEmbedAllFonts=true -dAutoFilterColorImages=false -dAutoFilterGrayImages=false -dColorImageFilter=/FlateEncode -dGrayImageFilter=/FlateEncode -dMonoImageFilter=/FlateEncode $(PAPER).ps $(PAPER).pdf

$(PAPER).ps: $(PAPER).dvi
	dvips -t A4 $(PAPER).dvi -o $(PAPER).ps

$(PAPER).bbl: $(PAPER).tex $(BIBFILE)
	bibtex $(PAPER)

$(PAPER).dvi: $(PAPER).tex $(FIG_DVI) # $(PAPER).bbl
	latex $(PAPER).tex

$(PAPER).pdf: $(PAPER).tex $(FIG_PDF) # $(PAPER).bbl
	pdflatex $(PAPER).tex

$(FIGDIR)/%.pdf: $(FIGDIR_XFIG)/%.fig
	sed -e /^4/d $< > datei
	fig2dev -L pdf datei > $(FIGDIR)/$*.pdf
	fig2dev -L pstex_t -p $* $< > $(FIGDIR)/$*.$(XFIG_TEX_EXT)
	rm datei

$(FIGDIR)/%.eps: $(FIGDIR_XFIG)/%.fig
	fig2dev -L pstex $< > $(FIGDIR)/$*.eps
	fig2dev -L pstex_t -p $* $< > $(FIGDIR)/$*.$(XFIG_TEX_EXT)

$(FIGDIR)/%.png: $(FIGDIR_PNG)/%.png
	./Scripts/resample-png-png $(PAPER).tex $(*F) $(IMGDPI)

$(FIGDIR)/%.eps: $(FIGDIR_PNG)/%.png
	./Scripts/resample-png-eps $(PAPER).tex $(*F) $(IMGDPI)

$(FIGDIR)/%.png: $(FIGDIR_JPEG)/%.jpg
	./Scripts/resample-jpeg-png $(PAPER).tex $(*F) $(IMGDPI)

$(FIGDIR)/%.eps: $(FIGDIR_JPEG)/%.jpg
	./Scripts/resample-jpeg-eps $(PAPER).tex $(*F) $(IMGDPI)

$(FIGDIR)/%.pdf: $(FIGDIR_EPS)/%.eps
	epstopdf $< --outfile=$(FIGDIR)/$*.pdf

$(FIGDIR)/%.eps: $(FIGDIR_EPS)/%.eps
	cp $< $(FIGDIR)

$(FIGDIR)/%.pdf: $(FIGDIR_EPS)/%.pdf
	cp $< $(FIGDIR)

$(FIGDIR)/%.eps: $(FIGDIR_EPS)/%.pdf
	pdftops -eps $< $(FIGDIR)/$*.eps

clean:
	rm -rf $(PAPER).pdf *.ps *.blg *.bbl *.dvi *.aux *.dvi *.log *~ core *.lbl
	rm -rf *.brf *.idx *.ilg *.ind *.lof *.lot *.out *.toc #$(FIGDIR)/*

texclean:
	rm -rf $(PAPER).pdf *.ps *.blg *.bbl *.dvi *.aux *.dvi *.log *~ core *.lbl
	rm -rf *.brf *.idx *.ilg *.ind *.lof *.lot *.out *.toc *.o a.out

find:
	find -printf  '%-64p %10s %A@ \n' | sort > allfiles.find.$(HOSTNAME)
