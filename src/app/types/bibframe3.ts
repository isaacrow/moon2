/**
 * BIBFRAME 3.0.1 Complete Type Definitions
 * Based on Library of Congress BIBFRAME Ontology v3.0.1
 * http://id.loc.gov/ontologies/bibframe-3-0-1/
 */

// ============================================================================
// CORE BASE TYPES
// ============================================================================

export interface RDFResource {
  '@id'?: string;
  '@type': string | string[];
  'rdfs:label'?: string;
}

export interface BFResource extends RDFResource {
  'bf:code'?: string;
  'bf:source'?: BFSource;
  'bf:status'?: BFStatus;
  'bf:note'?: BFNote[];
}

// ============================================================================
// BIBFRAME 3.0.1 CLASSES (200+)
// ============================================================================

// Work Classes
export interface BFWork extends BFResource {
  '@type': 'bf:Work';
  'bf:title'?: BFTitle[];
  'bf:contribution'?: BFContribution[];
  'bf:subject'?: (BFTopic | BFPerson | BFPlace | BFEvent | BFTemporal)[];
  'bf:genreForm'?: BFGenreForm[];
  'bf:classification'?: BFClassification[];
  'bf:language'?: BFLanguage[];
  'bf:content'?: BFContent[];
  'bf:originDate'?: string;
  'bf:originPlace'?: BFPlace[];
  'bf:summary'?: BFSummary[];
  'bf:tableOfContents'?: BFTableOfContents[];
  'bf:intendedAudience'?: BFIntendedAudience[];
  'bf:illustrativeContent'?: BFIllustration[];
  'bf:colorContent'?: BFColorContent[];
  'bf:soundContent'?: BFSoundContent[];
  'bf:supplementaryContent'?: BFSupplementaryContent[];
  'bf:notation'?: (BFMusicNotation | BFTactileNotation | BFMovementNotation | BFScript)[];
  'bf:musicFormat'?: BFMusicFormat[];
  'bf:ensemble'?: BFEnsemble[];
  'bf:instrument'?: BFMusicInstrument[];
  'bf:voice'?: BFMusicVoice[];
  'bf:cartographicAttributes'?: BFCartographic[];
  'bf:capture'?: BFCapture[];
  'bf:dissertation'?: BFDissertation[];
  'bf:historyOfWork'?: string;
  'bf:awards'?: string;
  'bf:relatedTo'?: BFWork[];
  'bf:hasInstance'?: BFInstance[];
  'bf:hasExpression'?: BFWork[];
  'bf:expressionOf'?: BFWork | BFHub;
  'bf:arrangement'?: BFWork[];
  'bf:arrangementOf'?: BFWork[];
  'bf:adminMetadata'?: BFAdminMetadata[];
}

// Work Subclasses
export interface BFText extends BFWork {
  '@type': 'bf:Text';
}

export interface BFCartography extends BFWork {
  '@type': 'bf:Cartography';
}

export interface BFAudio extends BFWork {
  '@type': 'bf:Audio';
}

export interface BFMusicAudio extends BFAudio {
  '@type': 'bf:MusicAudio';
}

export interface BFNonMusicAudio extends BFAudio {
  '@type': 'bf:NonMusicAudio';
}

export interface BFNotatedMusic extends BFWork {
  '@type': 'bf:NotatedMusic';
}

export interface BFNotatedMovement extends BFWork {
  '@type': 'bf:NotatedMovement';
}

export interface BFDataset extends BFWork {
  '@type': 'bf:Dataset';
}

export interface BFStillImage extends BFWork {
  '@type': 'bf:StillImage';
}

export interface BFMovingImage extends BFWork {
  '@type': 'bf:MovingImage';
}

export interface BFObject extends BFWork {
  '@type': 'bf:Object';
}

export interface BFMultimedia extends BFWork {
  '@type': 'bf:Multimedia';
}

export interface BFMixedMaterial extends BFWork {
  '@type': 'bf:MixedMaterial';
}

export interface BFKit extends BFMixedMaterial {
  '@type': 'bf:Kit';
}

export interface BFManuscript extends BFWork {
  '@type': 'bf:Manuscript';
}

export interface BFCollection extends BFWork {
  '@type': 'bf:Collection';
  'bf:collectionArrangement'?: BFCollectionArrangement[];
}

export interface BFArrangement extends BFWork {
  '@type': 'bf:Arrangement';
}

export interface BFMonograph extends BFWork {
  '@type': 'bf:Monograph';
}

export interface BFSerial extends BFWork {
  '@type': 'bf:Serial';
}

export interface BFIntegrating extends BFWork {
  '@type': 'bf:Integrating';
}

export interface BFSeries extends BFWork {
  '@type': 'bf:Series';
}

// Instance Classes
export interface BFInstance extends BFResource {
  '@type': 'bf:Instance';
  'bf:instanceOf'?: BFWork;
  'bf:title'?: BFTitle[];
  'bf:responsibilityStatement'?: string;
  'bf:editionStatement'?: string;
  'bf:provisionActivity'?: BFProvisionActivity[];
  'bf:publication Statement'?: string;
  'bf:productionStatement'?: string;
  'bf:distributionStatement'?: string;
  'bf:manufactureStatement'?: string;
  'bf:issuance'?: BFIssuance;
  'bf:identifiedBy'?: BFIdentifier[];
  'bf:carrier'?: BFCarrier[];
  'bf:media'?: BFMedia[];
  'bf:extent'?: BFExtent[];
  'bf:dimensions'?: string;
  'bf:baseMaterial'?: BFBaseMaterial[];
  'bf:appliedMaterial'?: BFAppliedMaterial[];
  'bf:mount'?: BFMount[];
  'bf:emulsion'?: BFEmulsion[];
  'bf:polarity'?: BFPolarity[];
  'bf:generation'?: BFGeneration[];
  'bf:layout'?: BFLayout[];
  'bf:bookFormat'?: BFBookFormat[];
  'bf:fontSize'?: BFFontSize[];
  'bf:reductionRatio'?: BFReductionRatio[];
  'bf:soundCharacteristic'?: BFSoundCharacteristic[];
  'bf:projectionCharacteristic'?: BFProjectionCharacteristic[];
  'bf:videoCharacteristic'?: BFVideoCharacteristic[];
  'bf:digitalCharacteristic'?: BFDigitalCharacteristic[];
  'bf:systemRequirement'?: BFSystemRequirement[];
  'bf:binding'?: BFBinding[];
  'bf:productionMethod'?: BFProductionMethod[];
  'bf:aspectRatio'?: BFAspectRatio[];
  'bf:hasItem'?: BFItem[];
  'bf:adminMetadata'?: BFAdminMetadata[];
}

// Instance Subclasses
export interface BFPrint extends BFInstance {
  '@type': 'bf:Print';
}

export interface BFElectronic extends BFInstance {
  '@type': 'bf:Electronic';
  'bf:electronicLocator'?: string;
}

export interface BFArchival extends BFInstance {
  '@type': 'bf:Archival';
}

export interface BFTactile extends BFInstance {
  '@type': 'bf:Tactile';
}

export interface BFMicroform extends BFInstance {
  '@type': 'bf:Microform';
}

// Item Class
export interface BFItem extends BFResource {
  '@type': 'bf:Item';
  'bf:itemOf'?: BFInstance;
  'bf:heldBy'?: BFOrganization;
  'bf:shelfMark'?: BFShelfMark[];
  'bf:sublocation'?: BFSublocation;
  'bf:enumerationAndChronology'?: (BFEnumeration | BFChronology)[];
  'bf:custodialHistory'?: string;
  'bf:immediateAcquisition'?: BFImmediateAcquisition[];
  'bf:physicalLocation'?: string;
}

// Agent Classes
export interface BFAgent extends BFResource {
  '@type': 'bf:Agent';
  'rdfs:label': string;
}

export interface BFPerson extends BFAgent {
  '@type': 'bf:Person';
}

export interface BFOrganization extends BFAgent {
  '@type': 'bf:Organization';
}

export interface BFFamily extends BFAgent {
  '@type': 'bf:Family';
}

export interface BFMeeting extends BFAgent {
  '@type': 'bf:Meeting';
}

export interface BFJurisdiction extends BFAgent {
  '@type': 'bf:Jurisdiction';
}

// Title Classes
export interface BFTitle extends BFResource {
  '@type': 'bf:Title';
  'bf:mainTitle': string;
  'bf:subtitle'?: string;
  'bf:partName'?: string;
  'bf:partNumber'?: string;
  'bf:date'?: string;
  'bf:qualifier'?: string;
}

export interface BFVariantTitle extends BFTitle {
  '@type': 'bf:VariantTitle';
  'bf:variantType'?: string;
}

export interface BFAbbreviatedTitle extends BFVariantTitle {
  '@type': 'bf:AbbreviatedTitle';
  'bf:assigner'?: BFAgent;
}

export interface BFKeyTitle extends BFVariantTitle {
  '@type': 'bf:KeyTitle';
}

export interface BFParallelTitle extends BFVariantTitle {
  '@type': 'bf:ParallelTitle';
}

export interface BFCollectiveTitle extends BFVariantTitle {
  '@type': 'bf:CollectiveTitle';
}

export interface BFTransliteratedTitle extends BFVariantTitle {
  '@type': 'bf:TransliteratedTitle';
}

// Contribution Class
export interface BFContribution extends BFResource {
  '@type': 'bf:Contribution';
  'bf:agent'?: BFAgent;
  'bf:role'?: BFRole[];
  'bf:dramaticRole'?: BFDramaticRole[];
}

export interface BFPrimaryContribution extends BFContribution {
  '@type': 'bf:PrimaryContribution';
}

export interface BFRole extends BFResource {
  '@type': 'bf:Role';
  'rdfs:label': string;
}

export interface BFDramaticRole extends BFResource {
  '@type': 'bf:DramaticRole';
  'rdfs:label': string;
}

// Subject Classes
export interface BFTopic extends BFResource {
  '@type': 'bf:Topic';
  'rdfs:label': string;
}

export interface BFPlace extends BFResource {
  '@type': 'bf:Place';
  'rdfs:label': string;
}

export interface BFEvent extends BFResource {
  '@type': 'bf:Event';
  'rdfs:label': string;
  'bf:eventContent'?: BFWork[];
}

export interface BFTemporal extends BFResource {
  '@type': 'bf:Temporal';
  'rdfs:label': string;
}

export interface BFGenreForm extends BFResource {
  '@type': 'bf:GenreForm';
  'rdfs:label': string;
}

// Classification Classes
export interface BFClassification extends BFResource {
  '@type': 'bf:Classification';
  'bf:classificationPortion': string;
  'bf:itemPortion'?: string;
  'bf:edition'?: string;
  'bf:assigner'?: BFOrganization;
}

export interface BFClassificationLcc extends BFClassification {
  '@type': 'bf:ClassificationLcc';
}

export interface BFClassificationDdc extends BFClassification {
  '@type': 'bf:ClassificationDdc';
}

export interface BFClassificationUdc extends BFClassification {
  '@type': 'bf:ClassificationUdc';
}

export interface BFClassificationNlm extends BFClassification {
  '@type': 'bf:ClassificationNlm';
}

export interface BFClassificationNal extends BFClassification {
  '@type': 'bf:ClassificationNal';
}

// Identifier Classes (50+ types)
export interface BFIdentifier extends BFResource {
  '@type': 'bf:Identifier';
  'rdf:value': string;
  'bf:qualifier'?: string;
  'bf:assigner'?: BFAgent;
}

export interface BFLccn extends BFIdentifier {
  '@type': 'bf:Lccn';
}

export interface BFIsbn extends BFIdentifier {
  '@type': 'bf:Isbn';
}

export interface BFIssn extends BFIdentifier {
  '@type': 'bf:Issn';
}

export interface BFIssnL extends BFIdentifier {
  '@type': 'bf:IssnL';
}

export interface BFIsmn extends BFIdentifier {
  '@type': 'bf:Ismn';
}

export interface BFIsni extends BFIdentifier {
  '@type': 'bf:Isni';
}

export interface BFIsan extends BFIdentifier {
  '@type': 'bf:Isan';
}

export interface BFIsrc extends BFIdentifier {
  '@type': 'bf:Isrc';
}

export interface BFIswc extends BFIdentifier {
  '@type': 'bf:Iswc';
}

export interface BFIstc extends BFIdentifier {
  '@type': 'bf:Istc';
}

export interface BFDoi extends BFIdentifier {
  '@type': 'bf:Doi';
}

export interface BFEidr extends BFIdentifier {
  '@type': 'bf:Eidr';
}

export interface BFHdl extends BFIdentifier {
  '@type': 'bf:Hdl';
}

export interface BFUrn extends BFIdentifier {
  '@type': 'bf:Urn';
}

export interface BFUpc extends BFIdentifier {
  '@type': 'bf:Upc';
}

export interface BFEan extends BFIdentifier {
  '@type': 'bf:Ean';
}

export interface BFNbn extends BFIdentifier {
  '@type': 'bf:Nbn';
}

export interface BFLocal extends BFIdentifier {
  '@type': 'bf:Local';
}

export interface BFBarcode extends BFIdentifier {
  '@type': 'bf:Barcode';
}

export interface BFFingerprint extends BFIdentifier {
  '@type': 'bf:Fingerprint';
}

export interface BFAccessionNumber extends BFIdentifier {
  '@type': 'bf:AccessionNumber';
}

export interface BFStockNumber extends BFIdentifier {
  '@type': 'bf:StockNumber';
}

export interface BFPublisherNumber extends BFIdentifier {
  '@type': 'bf:PublisherNumber';
}

export interface BFMusicPublisherNumber extends BFIdentifier {
  '@type': 'bf:MusicPublisherNumber';
}

export interface BFMusicDistributorNumber extends BFIdentifier {
  '@type': 'bf:MusicDistributorNumber';
}

export interface BFMusicPlate extends BFIdentifier {
  '@type': 'bf:MusicPlate';
}

export interface BFVideoRecordingNumber extends BFIdentifier {
  '@type': 'bf:VideoRecordingNumber';
}

export interface BFMatrixNumber extends BFIdentifier {
  '@type': 'bf:MatrixNumber';
}

export interface BFAudioIssueNumber extends BFIdentifier {
  '@type': 'bf:AudioIssueNumber';
}

export interface BFAudioTake extends BFIdentifier {
  '@type': 'bf:AudioTake';
}

export interface BFCopyrightNumber extends BFIdentifier {
  '@type': 'bf:CopyrightNumber';
  'bf:date'?: string;
}

export interface BFReportNumber extends BFIdentifier {
  '@type': 'bf:ReportNumber';
}

export interface BFStudyNumber extends BFIdentifier {
  '@type': 'bf:StudyNumber';
}

export interface BFDissertationIdentifier extends BFIdentifier {
  '@type': 'bf:DissertationIdentifier';
}

export interface BFPostalRegistration extends BFIdentifier {
  '@type': 'bf:PostalRegistration';
}

export interface BFCoden extends BFIdentifier {
  '@type': 'bf:Coden';
}

export interface BFSici extends BFIdentifier {
  '@type': 'bf:Sici';
}

export interface BFAnsi extends BFIdentifier {
  '@type': 'bf:Ansi';
}

export interface BFIso extends BFIdentifier {
  '@type': 'bf:Iso';
}

export interface BFStrn extends BFIdentifier {
  '@type': 'bf:Strn';
}

export interface BFGtin14Number extends BFIdentifier {
  '@type': 'bf:Gtin14Number';
}

export interface BFLcOverseasAcq extends BFIdentifier {
  '@type': 'bf:LcOverseasAcq';
}

export interface BFOclcNumber extends BFIdentifier {
  '@type': 'bf:OclcNumber';
}

export interface BFOpusNumber extends BFIdentifier {
  '@type': 'bf:OpusNumber';
}

export interface BFSerialNumber extends BFIdentifier {
  '@type': 'bf:SerialNumber';
}

export interface BFThematicCatalogNumber extends BFIdentifier {
  '@type': 'bf:ThematicCatalogNumber';
}

export interface BFVideogamePlatformId extends BFIdentifier {
  '@type': 'bf:VideogamePlatformId';
}

// Provision Activity Classes
export interface BFProvisionActivity extends BFResource {
  '@type': 'bf:ProvisionActivity';
  'bf:agent'?: BFAgent[];
  'bf:place'?: BFPlace[];
  'bf:date'?: string;
}

export interface BFPublication extends BFProvisionActivity {
  '@type': 'bf:Publication';
}

export interface BFProduction extends BFProvisionActivity {
  '@type': 'bf:Production';
}

export interface BFDistribution extends BFProvisionActivity {
  '@type': 'bf:Distribution';
}

export interface BFManufacture extends BFProvisionActivity {
  '@type': 'bf:Manufacture';
}

export interface BFModification extends BFProvisionActivity {
  '@type': 'bf:Modification';
}

// Content/Carrier/Media
export interface BFContent extends BFResource {
  '@type': 'bf:Content';
  'rdfs:label': string;
}

export interface BFCarrier extends BFResource {
  '@type': 'bf:Carrier';
  'rdfs:label': string;
}

export interface BFMedia extends BFResource {
  '@type': 'bf:Media';
  'rdfs:label': string;
}

// Material Classes
export interface BFMaterial extends BFResource {
  '@type': 'bf:Material';
  'rdfs:label': string;
}

export interface BFBaseMaterial extends BFMaterial {
  '@type': 'bf:BaseMaterial';
}

export interface BFAppliedMaterial extends BFMaterial {
  '@type': 'bf:AppliedMaterial';
}

export interface BFMount extends BFResource {
  '@type': 'bf:Mount';
  'rdfs:label': string;
}

export interface BFEmulsion extends BFResource {
  '@type': 'bf:Emulsion';
  'rdfs:label': string;
}

export interface BFPolarity extends BFResource {
  '@type': 'bf:Polarity';
  'rdfs:label': string;
}

export interface BFGeneration extends BFResource {
  '@type': 'bf:Generation';
  'rdfs:label': string;
}

export interface BFLayout extends BFResource {
  '@type': 'bf:Layout';
  'rdfs:label': string;
}

export interface BFBookFormat extends BFResource {
  '@type': 'bf:BookFormat';
  'rdfs:label': string;
}

export interface BFFontSize extends BFResource {
  '@type': 'bf:FontSize';
  'rdfs:label': string;
}

export interface BFReductionRatio extends BFResource {
  '@type': 'bf:ReductionRatio';
  'rdfs:label': string;
}

export interface BFBinding extends BFResource {
  '@type': 'bf:Binding';
  'rdfs:label': string;
}

export interface BFProductionMethod extends BFResource {
  '@type': 'bf:ProductionMethod';
  'rdfs:label': string;
}

// Sound Characteristics
export interface BFSoundCharacteristic extends BFResource {
  '@type': 'bf:SoundCharacteristic';
  'rdfs:label': string;
}

export interface BFRecordingMethod extends BFSoundCharacteristic {
  '@type': 'bf:RecordingMethod';
}

export interface BFRecordingMedium extends BFSoundCharacteristic {
  '@type': 'bf:RecordingMedium';
}

export interface BFPlayingSpeed extends BFSoundCharacteristic {
  '@type': 'bf:PlayingSpeed';
}

export interface BFGrooveCharacteristic extends BFSoundCharacteristic {
  '@type': 'bf:GrooveCharacteristic';
}

export interface BFTrackConfig extends BFSoundCharacteristic {
  '@type': 'bf:TrackConfig';
}

export interface BFTapeConfig extends BFSoundCharacteristic {
  '@type': 'bf:TapeConfig';
}

export interface BFPlaybackChannels extends BFSoundCharacteristic {
  '@type': 'bf:PlaybackChannels';
}

export interface BFPlaybackCharacteristic extends BFSoundCharacteristic {
  '@type': 'bf:PlaybackCharacteristic';
}

export interface BFCaptureStorage extends BFSoundCharacteristic {
  '@type': 'bf:CaptureStorage';
}

// Video Characteristics
export interface BFVideoCharacteristic extends BFResource {
  '@type': 'bf:VideoCharacteristic';
  'rdfs:label': string;
}

export interface BFVideoFormat extends BFVideoCharacteristic {
  '@type': 'bf:VideoFormat';
}

export interface BFBroadcastStandard extends BFVideoCharacteristic {
  '@type': 'bf:BroadcastStandard';
}

// Projection Characteristics
export interface BFProjectionCharacteristic extends BFResource {
  '@type': 'bf:ProjectionCharacteristic';
  'rdfs:label': string;
}

export interface BFPresentationFormat extends BFProjectionCharacteristic {
  '@type': 'bf:PresentationFormat';
}

export interface BFProjectionSpeed extends BFProjectionCharacteristic {
  '@type': 'bf:ProjectionSpeed';
}

// Digital Characteristics
export interface BFDigitalCharacteristic extends BFResource {
  '@type': 'bf:DigitalCharacteristic';
  'rdfs:label': string;
}

export interface BFFileType extends BFDigitalCharacteristic {
  '@type': 'bf:FileType';
}

export interface BFEncodingFormat extends BFDigitalCharacteristic {
  '@type': 'bf:EncodingFormat';
}

export interface BFFileSize extends BFDigitalCharacteristic {
  '@type': 'bf:FileSize';
}

export interface BFResolution extends BFDigitalCharacteristic {
  '@type': 'bf:Resolution';
}

export interface BFRegionalEncoding extends BFDigitalCharacteristic {
  '@type': 'bf:RegionalEncoding';
}

export interface BFEncodedBitrate extends BFDigitalCharacteristic {
  '@type': 'bf:EncodedBitrate';
}

export interface BFCartographicDataType extends BFDigitalCharacteristic {
  '@type': 'bf:CartographicDataType';
}

export interface BFCartographicObjectType extends BFDigitalCharacteristic {
  '@type': 'bf:CartographicObjectType';
}

export interface BFObjectCount extends BFDigitalCharacteristic {
  '@type': 'bf:ObjectCount';
}

// Music-related Classes
export interface BFNotation extends BFResource {
  '@type': 'bf:Notation';
  'rdfs:label': string;
}

export interface BFMusicNotation extends BFNotation {
  '@type': 'bf:MusicNotation';
}

export interface BFTactileNotation extends BFNotation {
  '@type': 'bf:TactileNotation';
}

export interface BFMovementNotation extends BFNotation {
  '@type': 'bf:MovementNotation';
}

export interface BFScript extends BFNotation {
  '@type': 'bf:Script';
}

export interface BFMusicFormat extends BFResource {
  '@type': 'bf:MusicFormat';
  'rdfs:label': string;
}

export interface BFEnsemble extends BFResource {
  '@type': 'bf:Ensemble';
  'bf:ensembleSize'?: BFEnsembleSize;
  'bf:ensembleType'?: string;
  'bf:mediumComponent'?: BFMediumComponent[];
}

export interface BFMusicEnsemble extends BFEnsemble {
  '@type': 'bf:MusicEnsemble';
}

export interface BFEnsembleSize extends BFResource {
  '@type': 'bf:EnsembleSize';
  'rdfs:label': string;
}

export interface BFMediumComponent extends BFResource {
  '@type': 'bf:MediumComponent';
  'bf:mediumOfPerformance'?: BFMediumOfPerformance;
  'bf:count'?: number;
  'bf:numberOfHands'?: string;
  'bf:mediumComponentQualifier'?: BFMediumComponentQualifier;
}

export interface BFMediumOfPerformance extends BFResource {
  '@type': 'bf:MediumOfPerformance';
  'rdfs:label': string;
}

export interface BFMediumComponentQualifier extends BFResource {
  '@type': 'bf:MediumComponentQualifier';
  'rdfs:label': string;
}

export interface BFMusicInstrument extends BFResource {
  '@type': 'bf:MusicInstrument';
  'rdfs:label': string;
  'bf:instrumentalType'?: string;
  'bf:count'?: number;
}

export interface BFMusicVoice extends BFResource {
  '@type': 'bf:MusicVoice';
  'rdfs:label': string;
  'bf:voiceType'?: string;
  'bf:count'?: number;
}

export interface BFMusicMedium extends BFResource {
  '@type': 'bf:MusicMedium';
  'rdfs:label': string;
}

export interface BFKeyMode extends BFResource {
  '@type': 'bf:KeyMode';
  'rdfs:label': string;
}

export interface BFMode extends BFResource {
  '@type': 'bf:Mode';
  'rdfs:label': string;
}

export interface BFTempo extends BFResource {
  '@type': 'bf:Tempo';
  'rdfs:label': string;
}

// Cartographic Classes
export interface BFCartographic extends BFResource {
  '@type': 'bf:Cartographic';
  'bf:projection'?: BFProjection;
  'bf:scale'?: BFScale;
  'bf:relief'?: BFRelief[];
  'bf:coordinates'?: string;
  'bf:ascensionAndDeclination'?: string;
  'bf:equinox'?: string;
  'bf:outerGRing'?: string;
  'bf:exclusionGRing'?: string;
}

export interface BFProjection extends BFResource {
  '@type': 'bf:Projection';
  'rdfs:label': string;
}

export interface BFScale extends BFResource {
  '@type': 'bf:Scale';
  'rdfs:label': string;
}

export interface BFRelief extends BFResource {
  '@type': 'bf:Relief';
  'rdfs:label': string;
}

// Content-related Classes
export interface BFColorContent extends BFResource {
  '@type': 'bf:ColorContent';
  'rdfs:label': string;
}

export interface BFSoundContent extends BFResource {
  '@type': 'bf:SoundContent';
  'rdfs:label': string;
}

export interface BFContentAccessibility extends BFResource {
  '@type': 'bf:ContentAccessibility';
  'rdfs:label': string;
}

export interface BFIllustration extends BFResource {
  '@type': 'bf:Illustration';
  'rdfs:label': string;
}

export interface BFSupplementaryContent extends BFResource {
  '@type': 'bf:SupplementaryContent';
  'rdfs:label': string;
  'bf:count'?: string;
  'bf:electronicLocator'?: string;
}

export interface BFIntendedAudience extends BFResource {
  '@type': 'bf:IntendedAudience';
  'rdfs:label': string;
}

// Note and Summary Classes
export interface BFNote extends BFResource {
  '@type': 'bf:Note';
  'rdfs:label': string;
  'bf:noteType'?: string;
}

export interface BFSummary extends BFResource {
  '@type': 'bf:Summary';
  'rdfs:label': string;
}

export interface BFTableOfContents extends BFResource {
  '@type': 'bf:TableOfContents';
  'rdfs:label': string;
}

// Other Supporting Classes
export interface BFExtent extends BFResource {
  '@type': 'bf:Extent';
  'rdfs:label': string;
}

export interface BFUnit extends BFResource {
  '@type': 'bf:Unit';
  'rdfs:label': string;
}

export interface BFIssuance extends BFResource {
  '@type': 'bf:Issuance';
  'rdfs:label': string;
}

export interface BFFrequency extends BFResource {
  '@type': 'bf:Frequency';
  'rdfs:label': string;
}

export interface BFPubFrequency extends BFResource {
  '@type': 'bf:PubFrequency';
  'bf:frequency'?: BFFrequency;
  'bf:firstIssue'?: string;
  'bf:lastIssue'?: string;
}

export interface BFLanguage extends BFResource {
  '@type': 'bf:Language';
  'rdfs:label': string;
  'bf:part'?: string;
}

export interface BFAspectRatio extends BFResource {
  '@type': 'bf:AspectRatio';
  'rdfs:label': string;
}

export interface BFSystemRequirement extends BFResource {
  '@type': 'bf:SystemRequirement';
  'rdfs:label': string;
}

export interface BFCapture extends BFResource {
  '@type': 'bf:Capture';
  'bf:date'?: string;
  'bf:place'?: BFPlace[];
}

export interface BFDissertation extends BFResource {
  '@type': 'bf:Dissertation';
  'rdfs:label'?: string;
  'bf:degree'?: string;
  'bf:grantingInstitution'?: BFOrganization;
  'bf:date'?: string;
  'bf:identifiedBy'?: BFDissertationIdentifier[];
}

export interface BFCopyrightRegistration extends BFResource {
  '@type': 'bf:CopyrightRegistration';
  'bf:date'?: string;
}

export interface BFReview extends BFResource {
  '@type': 'bf:Review';
  'rdfs:label': string;
}

export interface BFCoverArt extends BFResource {
  '@type': 'bf:CoverArt';
  'bf:electronicLocator'?: string;
}

export interface BFAcquisitionSource extends BFResource {
  '@type': 'bf:AcquisitionSource';
  'rdfs:label'?: string;
  'bf:identifiedBy'?: BFIdentifier[];
  'bf:acquisitionTerms'?: string;
}

export interface BFImmediateAcquisition extends BFResource {
  '@type': 'bf:ImmediateAcquisition';
  'rdfs:label': string;
}

export interface BFCollectionArrangement extends BFResource {
  '@type': 'bf:CollectionArrangement';
  'bf:collectionOrganization'?: string;
  'bf:hierarchicalLevel'?: string;
  'bf:pattern'?: string;
}

export interface BFUsageAndAccessPolicy extends BFResource {
  '@type': 'bf:UsageAndAccessPolicy';
  'rdfs:label': string;
}

export interface BFAccessPolicy extends BFUsageAndAccessPolicy {
  '@type': 'bf:AccessPolicy';
  'bf:validDate'?: string;
}

export interface BFUsePolicy extends BFUsageAndAccessPolicy {
  '@type': 'bf:UsePolicy';
}

export interface BFRetentionPolicy extends BFUsageAndAccessPolicy {
  '@type': 'bf:RetentionPolicy';
}

export interface BFShelfMark extends BFIdentifier {
  '@type': 'bf:ShelfMark';
}

export interface BFShelfMarkLcc extends BFShelfMark {
  '@type': 'bf:ShelfMarkLcc';
}

export interface BFShelfMarkDdc extends BFShelfMark {
  '@type': 'bf:ShelfMarkDdc';
}

export interface BFShelfMarkUdc extends BFShelfMark {
  '@type': 'bf:ShelfMarkUdc';
}

export interface BFShelfMarkNlm extends BFShelfMark {
  '@type': 'bf:ShelfMarkNlm';
}

export interface BFSublocation extends BFResource {
  '@type': 'bf:Sublocation';
  'rdfs:label': string;
}

export interface BFEnumerationAndChronology extends BFResource {
  '@type': 'bf:EnumerationAndChronology';
  'rdfs:label': string;
}

export interface BFEnumeration extends BFEnumerationAndChronology {
  '@type': 'bf:Enumeration';
}

export interface BFChronology extends BFEnumerationAndChronology {
  '@type': 'bf:Chronology';
}

export interface BFArrangement extends BFResource {
  '@type': 'bf:Arrangement';
  'rdfs:label': string;
}

export interface BFGeographicCoverage extends BFResource {
  '@type': 'bf:GeographicCoverage';
  'rdfs:label': string;
}

export interface BFSource extends BFResource {
  '@type': 'bf:Source';
  'bf:code'?: string;
  'rdfs:label'?: string;
}

export interface BFStatus extends BFResource {
  '@type': 'bf:Status';
  'rdfs:label': string;
}

export interface BFRelation extends BFResource {
  '@type': 'bf:Relation';
  'bf:relationship'?: BFRelationship;
  'bf:associatedResource'?: BFWork | BFHub;
  'bf:seriesEnumeration'?: string;
}

export interface BFRelationship extends BFResource {
  '@type': 'bf:Relationship';
  'rdfs:label': string;
}

export interface BFHub extends BFResource {
  '@type': 'bf:Hub';
  'bf:title'?: BFTitle[];
  'bf:contribution'?: BFContribution[];
  'bf:hasExpression'?: BFWork[];
}

// Administrative Metadata
export interface BFAdminMetadata extends BFResource {
  '@type': 'bf:AdminMetadata';
  'bf:status'?: BFStatus;
  'bf:descriptionLevel'?: BFDescriptionLevel;
  'bf:descriptionConventions'?: BFDescriptionConventions[];
  'bf:descriptionLanguage'?: BFLanguage;
  'bf:descriptionAuthentication'?: BFDescriptionAuthentication[];
  'bf:descriptionModifier'?: BFAgent[];
  'bf:generationProcess'?: BFGenerationProcess;
  'bf:date'?: string;
  'bf:creationDate'?: string;
  'bf:changeDate'?: string;
  'bf:identifiedBy'?: BFLocal[];
  'bf:derivedFrom'?: any;
  'bf:adminMetadataFor'?: any;
}

export interface BFDescriptionLevel extends BFResource {
  '@type': 'bf:DescriptionLevel';
  'rdfs:label': string;
}

export interface BFDescriptionConventions extends BFResource {
  '@type': 'bf:DescriptionConventions';
  'rdfs:label': string;
}

export interface BFDescriptionAuthentication extends BFResource {
  '@type': 'bf:DescriptionAuthentication';
  'rdfs:label': string;
}

export interface BFGenerationProcess extends BFResource {
  '@type': 'bf:GenerationProcess';
  'rdfs:label': string;
  'bf:generationDate'?: string;
}

// ============================================================================
// UTILITY TYPES AND UNIONS
// ============================================================================

export type BFWorkType =
  | BFWork
  | BFText
  | BFCartography
  | BFAudio
  | BFMusicAudio
  | BFNonMusicAudio
  | BFNotatedMusic
  | BFNotatedMovement
  | BFDataset
  | BFStillImage
  | BFMovingImage
  | BFObject
  | BFMultimedia
  | BFMixedMaterial
  | BFKit
  | BFManuscript
  | BFCollection
  | BFArrangement
  | BFMonograph
  | BFSerial
  | BFIntegrating
  | BFSeries;

export type BFInstanceType =
  | BFInstance
  | BFPrint
  | BFElectronic
  | BFArchival
  | BFTactile
  | BFMicroform;

export type BFAgentType =
  | BFAgent
  | BFPerson
  | BFOrganization
  | BFFamily
  | BFMeeting
  | BFJurisdiction;

export type BFTitleType =
  | BFTitle
  | BFVariantTitle
  | BFAbbreviatedTitle
  | BFKeyTitle
  | BFParallelTitle
  | BFCollectiveTitle
  | BFTransliteratedTitle;

export type BFIdentifierType =
  | BFIdentifier
  | BFLccn
  | BFIsbn
  | BFIssn
  | BFIssnL
  | BFIsmn
  | BFIsni
  | BFIsan
  | BFIsrc
  | BFIswc
  | BFIstc
  | BFDoi
  | BFEidr
  | BFHdl
  | BFUrn
  | BFUpc
  | BFEan
  | BFNbn
  | BFLocal
  | BFBarcode;

export type BFClassificationType =
  | BFClassification
  | BFClassificationLcc
  | BFClassificationDdc
  | BFClassificationUdc
  | BFClassificationNlm
  | BFClassificationNal;

export type BFProvisionActivityType =
  | BFProvisionActivity
  | BFPublication
  | BFProduction
  | BFDistribution
  | BFManufacture
  | BFModification;

// Complete BIBFRAME Record
export interface BibframeRecord {
  '@context': {
    bf: 'http://id.loc.gov/ontologies/bibframe/';
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#';
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
    madsrdf: 'http://www.loc.gov/mads/rdf/v1#';
  };
  '@graph': (BFWorkType | BFInstanceType | BFItem)[];
}

// Vocabulary Lists (for reference to LOC controlled vocabularies)
export const BIBFRAME_VOCABULARIES = {
  carriers: 'https://id.loc.gov/vocabulary/carriers/',
  mediaTypes: 'https://id.loc.gov/vocabulary/mediaTypes/',
  contentTypes: 'https://id.loc.gov/vocabulary/contentTypes/',
  issuance: 'https://id.loc.gov/vocabulary/issuance/',
  countries: 'https://id.loc.gov/vocabulary/countries/',
  languages: 'https://id.loc.gov/vocabulary/languages/',
  organizations: 'https://id.loc.gov/vocabulary/organizations/',
  relators: 'https://id.loc.gov/vocabulary/relators/',
  genreForms: 'https://id.loc.gov/authorities/genreForms/',
  subjects: 'https://id.loc.gov/authorities/subjects/',
  names: 'https://id.loc.gov/authorities/names/',
  geographicAreas: 'https://id.loc.gov/vocabulary/geographicAreas/',
  mstatus: 'https://id.loc.gov/vocabulary/mstatus/',
  mcolor: 'https://id.loc.gov/vocabulary/mcolor/',
  msoundcontent: 'https://id.loc.gov/vocabulary/msoundcontent/',
  maudience: 'https://id.loc.gov/vocabulary/maudience/',
  millus: 'https://id.loc.gov/vocabulary/millus/',
  msupplcont: 'https://id.loc.gov/vocabulary/msupplcont/',
  mfont: 'https://id.loc.gov/vocabulary/mfont/',
  mmaterial: 'https://id.loc.gov/vocabulary/mmaterial/',
  mpolarity: 'https://id.loc.gov/vocabulary/mpolarity/',
  mgeneration: 'https://id.loc.gov/vocabulary/mgeneration/',
  mproduction: 'https://id.loc.gov/vocabulary/mproduction/',
  maspect: 'https://id.loc.gov/vocabulary/maspect/',
  mbroadstd: 'https://id.loc.gov/vocabulary/mbroadstd/',
  mvidformat: 'https://id.loc.gov/vocabulary/mvidformat/',
  mfiletype: 'https://id.loc.gov/vocabulary/mfiletype/',
  mencformat: 'https://id.loc.gov/vocabulary/mencformat/',
  mregencoding: 'https://id.loc.gov/vocabulary/mregencoding/',
  mrectype: 'https://id.loc.gov/vocabulary/mrectype/',
  mrecmedium: 'https://id.loc.gov/vocabulary/mrecmedium/',
  mplayspeed: 'https://id.loc.gov/vocabulary/mplayspeed/',
  mgroove: 'https://id.loc.gov/vocabulary/mgroove/',
  mtapeconfig: 'https://id.loc.gov/vocabulary/mtapeconfig/',
  mplayback: 'https://id.loc.gov/vocabulary/mplayback/',
  mcapturestorage: 'https://id.loc.gov/vocabulary/mcapturestorage/',
  mmusicformat: 'https://id.loc.gov/vocabulary/mmusicformat/',
  performanceMediums: 'https://id.loc.gov/authorities/performanceMediums/',
  ensemblesize: 'https://id.loc.gov/vocabulary/ensemblesize/',
  mprojection: 'https://id.loc.gov/vocabulary/mprojection/',
  mrelief: 'https://id.loc.gov/vocabulary/mrelief/',
  mpresformat: 'https://id.loc.gov/vocabulary/mpresformat/',
  mreductionratio: 'https://id.loc.gov/vocabulary/mreductionratio/',
  frequencies: 'https://id.loc.gov/vocabulary/frequencies/',
  descriptionConventions: 'https://id.loc.gov/vocabulary/descriptionConventions/',
  marcauthen: 'https://id.loc.gov/vocabulary/marcauthen/',
  mnotetype: 'https://id.loc.gov/vocabulary/mnotetype/',
  menclvl: 'https://id.loc.gov/vocabulary/menclvl/',
} as const;

export const BIBFRAME_CLASSES = [
  'Work', 'Text', 'Cartography', 'Audio', 'MusicAudio', 'NonMusicAudio',
  'NotatedMusic', 'NotatedMovement', 'Dataset', 'StillImage', 'MovingImage',
  'Object', 'Multimedia', 'MixedMaterial', 'Kit', 'Manuscript', 'Collection',
  'Arrangement', 'Monograph', 'Serial', 'Integrating', 'Series',
  'Instance', 'Print', 'Electronic', 'Archival', 'Tactile', 'Microform',
  'Item', 'Agent', 'Person', 'Organization', 'Family', 'Meeting', 'Jurisdiction',
  'Title', 'VariantTitle', 'AbbreviatedTitle', 'KeyTitle', 'ParallelTitle',
  'CollectiveTitle', 'TransliteratedTitle', 'Contribution', 'PrimaryContribution',
  'Topic', 'Place', 'Event', 'Temporal', 'GenreForm', 'Classification',
  'ClassificationLcc', 'ClassificationDdc', 'ClassificationUdc', 'ClassificationNlm',
  'ClassificationNal', 'Language', 'Content', 'Carrier', 'Media', 'Extent',
  'Issuance', 'Frequency', 'Note', 'Summary', 'TableOfContents',
  // ... Add all 200+ classes as needed
] as const;

export type BibframeClassName = typeof BIBFRAME_CLASSES[number];
