import { Type, Square, CheckSquare, Image, Download, Upload, Trash2, FileText } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/app/components/ui/tooltip';

interface ToolbarProps {
  onAddTextField: () => void;
  onAddFormTextField: () => void;
  onAddCheckbox: () => void;
  onAddCheckedCheckbox: () => void;
  onAddImage: () => void;
  onApplyToPdf: () => void;
  onDeleteSelected: () => void;
  hasSelection: boolean;
  isApplying: boolean;
  isApplyDisabled?: boolean;
}

export function Toolbar({
  onAddTextField,
  onAddFormTextField,
  onAddCheckbox,
  onAddCheckedCheckbox,
  onAddImage,
  onApplyToPdf,
  onDeleteSelected,
  hasSelection,
  isApplying,
  isApplyDisabled = false,
}: ToolbarProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 p-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onAddTextField} 
                className="h-9 w-9 text-gray-700 hover:bg-[#fff5f0] hover:text-[#ff911d]"
              >
                <Type className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 text-white border-gray-700">
              Add Text Field
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onAddFormTextField} 
                className="h-9 w-9 text-gray-700 hover:bg-[#fff5f0] hover:text-[#ff911d]"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 text-white border-gray-700">
              Add Form Text Field
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onAddCheckbox} 
                className="h-9 w-9 text-gray-700 hover:bg-[#fff5f0] hover:text-[#ff911d]"
              >
                <Square className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 text-white border-gray-700">
              Add Checkbox
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onAddCheckedCheckbox} 
                className="h-9 w-9 text-gray-700 hover:bg-[#fff5f0] hover:text-[#ff911d]"
              >
                <CheckSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 text-white border-gray-700">
              Add Checked Checkbox
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onAddImage} 
                className="h-9 w-9 text-gray-700 hover:bg-[#fff5f0] hover:text-[#ff911d]"
              >
                <Image className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 text-white border-gray-700">
              Add Image
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-2 bg-gray-300" />

        {hasSelection && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onDeleteSelected} 
                  className="h-9 w-9 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 text-white border-gray-700">
                Delete Selected
              </TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="h-6 mx-2 bg-gray-300" />
          </>
        )}

        <div className="flex-1" />

        <Button 
          onClick={onApplyToPdf} 
          disabled={isApplying || isApplyDisabled} 
          className="gap-2 bg-[#ff911d] cursor-pointer hover:bg-[#ff7a00] text-white font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isApplying ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Applying...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 " />
              Apply to PDF
            </>
          )}
        </Button>
      </div>
    </TooltipProvider>
  );
}
