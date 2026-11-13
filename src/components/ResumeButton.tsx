import { Download, ExternalLink } from "lucide-react";
import { useState } from "react";
import ArcLink from "./ArcLink";
import { Button } from "./arc/button/button";
import { Dialog, DialogContent } from "./arc/dialog/dialog";
import { HoverCard } from "./arc/hover-card/hover-card";
import { Icon } from "./icons";

/**
 * Résumé button: hovering shows a small preview of the first page; clicking
 * opens the PDF in an Arc dialog (with download / new-tab links) instead of
 * leaving the page.
 */
export default function ResumeButton({ href, preview }: { href: string; preview?: string }) {
  const [open, setOpen] = useState(false);
  const button = (
    <Button variant="secondary" size="sm" type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">
      Résumé {Icon.arrow()}
    </Button>
  );
  return (
    <>
      {/* The preview is unmounted while the dialog is open, so it can never sit on top of it. */}
      {preview && !open ? (
        <HoverCard
          className="resume-peek"
          side="bottom"
          align="start"
          openDelay={80}
          content={
            <figure className="resume-peek__fig">
              <img src={preview} alt="Preview of the first page of the résumé" />
            </figure>
          }
        >
          {button}
        </HoverCard>
      ) : (
        button
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="resume-modal" title="Résumé" description="Jaisuriya P K · PDF">
          <iframe className="resume-modal__frame" src={`${href}#view=FitH&toolbar=0`} title="Résumé (PDF)" />
          <div className="resume-modal__actions">
            <ArcLink variant="primary" size="sm" href={href} download>
              <Download size={15} /> Download
            </ArcLink>
            <ArcLink size="sm" href={href} target="_blank" rel="noreferrer">
              <ExternalLink size={15} /> Open in new tab
            </ArcLink>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
