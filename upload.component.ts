import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FileMetadataService } from './filemetadata.service';
import { SubCategories } from './filemetadatalisting.model';
import { FileMetadata } from './filemetadata.model';
import { FileMetadataListing } from './filemetadatalisting.model';
import { FileExtension } from './extension';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'as-upload',
    template: require('./upload.component.html'),
    styles: [`
    input.ng-dirty.ng-invalid { border: solid red 2px; }
    select.ng-dirty.ng-invalid { border: solid red 2px; }
  `]

})

export class UploadComponent {
    public showErrorMsg: boolean;
    public fileMetadata: FileMetadata;
    public subcategory: SubCategories[];
    public subJsonData: Object[];
    public category: FileMetadataListing[];
    public fileUploadSuccess: number;
    public counterValue: number;
    public date: Date = new Date();
    public expDate: string;
    public isDisableIncrement: Boolean;
    public isDisableDecrement: Boolean;
    public previewMsg: String;
    public showPreview: Boolean;
    public wrongExtension: Boolean;
    public fileExtension: String;
    public originalForm = {};
    public invalidFile: boolean;
    @Input() inputData;
    @Output() outputEvent = new EventEmitter();
    @Output() inputDataChange = new EventEmitter();
    constructor(private filemetadataService: FileMetadataService) {
        this.fileMetadata = new FileMetadata
            (new Date(), 0, 0, new Date().toDateString(), FileExtension.txt, ' ', ' ', ' ', 'HUM', new Date(), 2, 1);
        this.subcategory = [];
        this.category = [new FileMetadataListing(this.subcategory)];
        this.filemetadataService.getCategories().subscribe(res => this.category = res);
        this.fileUploadSuccess = 0;
        this.fileMetadata.displayName = '';
        this.fileMetadata.file = '';
        this.fileMetadata.expirationDate = '';
        this.date = new Date();
        this.counterValue = this.date.getFullYear() + 1;
        this.expDate = this.date.getMonth() + 1 + '/' + this.date.getDate() + '/' + (this.date.getFullYear() + 1);
        this.fileMetadata.expirationDate = this.expDate;
        this.isDisableIncrement = true;
        this.isDisableDecrement = false;
        this.showPreview = true;
        this.wrongExtension = false;
        this.fileExtension = '';
        this.invalidFile = false;
        this.originalForm = {
            'displayName': this.fileMetadata.displayName,
            'expDate': this.fileMetadata.expirationDate,
            'category': this.fileMetadata.categoryId,
            'subcategory': this.fileMetadata.subCategoryId,
            'file': this.fileMetadata.file,
            'extension': this.fileExtension
        };
    }
    changeComponentValue(value: boolean) {
        this.outputEvent.emit(value);
        this.inputDataChange.emit(value);
    }
    increment(form: NgForm) {
        this.counterValue++;
        this.fileMetadata.expirationDate = this.date.getMonth() + 1 + '/' + this.date.getDate() + '/' + this.counterValue;
        this.isDisableDecrement = false;
        this.isDisableIncrement = false;
        if (this.counterValue === (this.date.getFullYear() + 8)) {
            this.isDisableIncrement = false;
            this.isDisableDecrement = true;
            return;
        }
    }
    decrement(form: NgForm) {
        this.counterValue--;
        this.fileMetadata.expirationDate = this.date.getMonth() + 1 + '/' + this.date.getDate() + '/' + this.counterValue;
        this.isDisableDecrement = false;
        this.isDisableIncrement = false;
        if (this.counterValue === (this.date.getFullYear() + 1)) {
            this.isDisableIncrement = true;
            this.isDisableDecrement = false;
            return;
        }
    }
    reset(form: NgForm) {
        form.reset(this.originalForm);
        this.showPreview = true;
        this.fileExtension = '';
        this.showErrorMsg = false;
        this.wrongExtension = false;
        if (form.untouched && form.pristine) {
            document.getElementById('displayName').className = 'form-control';
            document.getElementById('expDate').className = 'form-control';
            document.getElementById('category').className = 'form-control';
            document.getElementById('subcategory').className = 'form-control';
            document.getElementById('file').className = 'form-control';
        }
    }
    changeSubCate(selectedCategory) {
        for (let x = 0; x < this.category.length; x++) {
            if (this.category[x].id === Number(selectedCategory.target.value)) {
                this.subJsonData = this.category[x].subCategories;
            }
        }
    }
    validateFile() {
        this.invalidFile = true;
    }
    fileChanged($event) {
        this.invalidFile = false;
        this.fileMetadata.fileName = $event.srcElement.files[0].name;
        this.fileMetadata.file = $event.srcElement.files;
        let file = (<HTMLInputElement>document.querySelector('input[type=file]')).files[0];
        let reader = new FileReader();
        let self = this;
        let extension = file.name.split('.').pop();
        this.fileExtension = extension;
        if (extension === 'txt' || extension === 'pdf' || extension === 'xlsx' ||
            extension === 'xls' || extension === 'docx' || extension === 'doc' ||
            extension === 'csv' || extension === 'tiff' || extension === 'rtf') {
            this.wrongExtension = false;
            reader.addEventListener('load', function () {
                self.showPreview = false;
                if (extension === 'txt' || extension === 'csv' || extension === 'rtf') {
                    if (extension === 'txt' || extension === 'rtf') {
                        self.previewMsg = reader.result;
                    } else {
                        self.createTable(reader.result);
                    }
                } else if (extension === 'tiff') {
                    let element: HTMLImageElement;
                    element = <HTMLImageElement>document.getElementById('imageUpload');
                    element.src = reader.result;
                } else {
                    self.previewMsg = 'This file type is not supported by the browser';
                }
            }, false);

            if (file) {
                if (extension === 'tiff') {
                    reader.readAsDataURL(file);
                } else {
                    reader.readAsText(file);
                }
            }
        } else { this.wrongExtension = true; }

    }
    createTable(data) {
        let tabletag = '<table>';
        let arr = data.split(/[\n\r]/g);
        for (let i = 0; i < arr.length; i++) {
            let col = arr[i].split(',');
            if (i === 0) {
                tabletag = tabletag + '<tr>';
                for (let j = 0; j < col.length; j++) {
                    tabletag += '<th>';
                    tabletag += col[j];
                    tabletag += '</th>';
                }
                tabletag += '</tr>';
            } else {
                tabletag = tabletag + '<tr>';
                for (let j = 0; j < col.length; j++) {
                    tabletag += '<td>';
                    tabletag += col[j];
                    tabletag += '</td>';
                }
                tabletag += '</tr>';
            }
        }
        tabletag += '</table>';
        document.getElementById('csvTable').innerHTML = tabletag;
    }
    checkLength(name) {
        if (name.target.value && (name.target.value.toString().length >= 40)) {
            this.showErrorMsg = true;
            name.target.value = name.target.value.substring(0, 40);
        } else {
            this.showErrorMsg = false;
        }
    }
    onSubmit(form: NgForm) {
        let fileMetadata = FileMetadata.clone(this.fileMetadata);
        fileMetadata.fileExtensionId = FileExtension[this.fileExtension.toString()];
        form.reset(this.originalForm);
        this.fileMetadata.expirationDate = this.expDate;
        this.showPreview = true;
        this.fileExtension = '';
        this.showErrorMsg = false;
        this.wrongExtension = false;
        this.filemetadataService.addFileMetaData(fileMetadata).subscribe(res => this.addSuccessfull(res));
    };
    addSuccessfull(createdFileMetadataId: number) {
        if (createdFileMetadataId > 0) {
            this.fileMetadata.clear(); this.fileUploadSuccess = createdFileMetadataId;
        }
        if (createdFileMetadataId < 0) { this.fileUploadSuccess = -1; }
    }
}
