import React from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { 
  Download, 
  Upload, 
  FileJson, 
  FileCode, 
  FileText,
  ExternalLink,
  Settings,
  HelpCircle,
  Workflow,
  Book
} from 'lucide-react';

interface AdvancedToolbarProps {
  onExportJSON?: () => void;
  onExportRDF?: () => void;
  onExportXML?: () => void;
  onImport?: () => void;
  onOpenBibframeTools?: () => void;
  onOpenHelp?: () => void;
  onOpenOpacViewer?: () => void;
}

export function AdvancedToolbar({
  onExportJSON,
  onExportRDF,
  onExportXML,
  onImport,
  onOpenBibframeTools,
  onOpenHelp,
  onOpenOpacViewer,
}: AdvancedToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Export Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Export Format</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onExportJSON}>
            <FileJson className="h-4 w-4 mr-2" />
            JSON-LD
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportRDF}>
            <FileCode className="h-4 w-4 mr-2" />
            RDF/XML
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportXML}>
            <FileText className="h-4 w-4 mr-2" />
            MARCXML
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* BIBFRAME Tools */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Workflow className="h-4 w-4 mr-2" />
            Tools
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>BIBFRAME Tools</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onOpenOpacViewer}>
            <Book className="h-4 w-4 mr-2" />
            OPAC Viewer
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a 
              href="https://id.loc.gov/tools/bibframe/comparebf-lccn/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Compare BIBFRAME
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a 
              href="https://id.loc.gov/tools/bibframe/comparebf-lccn/editor.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              BIBFRAME Editor (LOC)
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a 
              href="https://id.loc.gov/ontologies/bibframe.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              BIBFRAME Ontology
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a 
              href="https://www.loc.gov/bibframe/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              BIBFRAME Initiative
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* External Resources */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Resources
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>External Resources</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a 
              href="https://afiqa.net" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              AFIQA API
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a 
              href="https://kiqp.net" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              KIQP OPAC
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a 
              href="https://viaf.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              VIAF
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a 
              href="https://www.wikidata.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Wikidata
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Help */}
      <Button variant="outline" size="sm" onClick={onOpenHelp}>
        <HelpCircle className="h-4 w-4 mr-2" />
        Help
      </Button>
    </div>
  );
}
